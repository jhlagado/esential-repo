import { ExpressionRef, Module } from 'binaryen';
import { Expression, TypeDef, TupleObj } from './types';
import { setTypeDef } from './typedefs';
import { isArray, isPrimitive } from './utils';

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

