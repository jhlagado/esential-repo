import { ExpressionRef, i32, Module, none, Type } from 'binaryen';
import { Expression, TypeDef, TupleObj, Dict } from './types';
import { asType, getLiteral, getTypeDef, setTypeDef } from './typedefs';
import { asArray, isArray, isPrimitive } from './utils';

const tupleProxies = new Map();

export const stripTupleProxy = (expr: Expression): Expression => {
  return tupleProxies.has(expr as any) ? tupleProxies.get(expr) : expr;
};

export const getAssignable = (module: Module) => (expression: Expression): ExpressionRef => {
  const stripped = stripTupleProxy(expression);
  if (isPrimitive<ExpressionRef>(stripped)) {
    return stripped;
  } else {
    const exprArray = isArray<ExpressionRef>(stripped)
      ? stripped
      : Object.keys(stripped)
          .sort()
          .map(key => stripped[key]);
    return module.tuple.make(exprArray);
  }
};

export const makeTupleProxy = (module: Module, expr: ExpressionRef, typeDef: TypeDef): TupleObj => {
  const boxed = new Number(expr);
  const proxy = new Proxy(boxed, {
    get(_target: any, prop: number | string) {
      if (isPrimitive<ExpressionRef>(typeDef)) {
        throw new Error(`Cannot index a primitive value`);
      } else if (isArray<ExpressionRef>(typeDef)) {
        const index = prop as number;
        if (index >= typeDef.length) {
          throw new Error(`Max tuple index should be ${typeDef.length} but received ${prop}`);
        }
        const valueExpr = module.tuple.extract(expr, index);
        setTypeDef(valueExpr, typeDef[index]);
        return valueExpr;
      } else {
        const typeDefDict = typeDef;
        const index = Object.keys(typeDef).indexOf(prop as string);
        if (index < 0) {
          throw new Error(`Could not find ${prop} in record`);
        }
        const valueExpr = module.tuple.extract(expr, index);
        setTypeDef(valueExpr, typeDefDict[prop]);
        return valueExpr;
      }
    },
  });
  tupleProxies.set(proxy, expr);
  return proxy;
};

export const applyTypeDefPrimitive = (
  module: Module,
  expr: ExpressionRef,
  typeDef?: TypeDef,
): ExpressionRef => {
  const exprTypeDef = getTypeDef(expr, false);
  if (exprTypeDef === none) {
    return getLiteral(module, expr, asType(typeDef || i32));
  } else {
    if (typeDef != null && asType(typeDef) !== asType(exprTypeDef)) {
      throw new Error(`Type mismatch: expected ${typeDef} but got ${exprTypeDef}`);
    }
    return expr;
  }
};

export const applyTypeDef = (
  module: Module,
  expression: Expression,
  typeDef?: TypeDef,
): ExpressionRef => {
  const stripped = stripTupleProxy(expression);
  if (isPrimitive<ExpressionRef>(stripped)) {
    return applyTypeDefPrimitive(module, stripped, typeDef);
  } else {
    const typeArray = asArray<Type>(typeDef as any);
    const exprArray = asArray<ExpressionRef>(stripped).map((expr, index) => {
      return applyTypeDefPrimitive(module, expr, typeArray[index]);
    });
    const tupleExpr = module.tuple.make(exprArray);
    setTypeDef(tupleExpr, typeArray);
    return tupleExpr;
  }
};
