import { auto, ExpressionRef, Module, none } from 'binaryen';
import { VarDefs, Expression, TypeDef, Dict, VarsAccessor, TupleObj } from './types';
import { inferTypeDef, asType, setTypeDef, getTypeDef } from './typedefs';
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
          .map(key => (stripped)[key]);
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

export const varGet = (module: Module, varDefs: VarDefs, prop: string) => {
  if (!(prop in varDefs)) {
    throw new Error(`Getter: unknown variable '${prop}'`);
  }
  const varNames = Object.keys(varDefs);
  const index = varNames.lastIndexOf(prop);
  const typeDef = varDefs[prop];
  const type = asType(typeDef);
  const expr = module.local.get(index, type);
  setTypeDef(expr, typeDef);
  return isPrimitive<ExpressionRef>(typeDef) ? expr : makeTupleProxy(module, expr, typeDef);
};

export const varSet = (
  module: Module,
  varDefs: VarDefs,
  prop: string,
  expression: Expression,
): ExpressionRef => {
  const expr = getAssignable(module)(expression) as ExpressionRef;
  let typeDef = varDefs[prop];
  if (typeDef == null) {
    typeDef = inferTypeDef(stripTupleProxy(expression));
    varDefs[prop] = typeDef;
    setTypeDef(expr, typeDef);
  } else {
    const exprTypeDef = getTypeDef(expr, false);
    if (exprTypeDef !== none && asType(exprTypeDef) !== asType(typeDef)) {
      throw new Error(`Wrong assignment type, expected ${typeDef} and got ${exprTypeDef}`);
    }
  }
  const index = Object.keys(varDefs).lastIndexOf(prop);
  return module.local.set(index, expr);
};

export const varSetExpression = (module: Module, varDefs: Dict<TypeDef>) => (value: Expression) => {
  const expr: ExpressionRef = isPrimitive<ExpressionRef>(value)
    ? (value as number)
    : module.block(
        null as any,
        isArray<ExpressionRef>(value)
          ? value.map(expr => expr)
          : Object.entries(value).map(([prop, expr]) => varSet(module, varDefs, prop, expr)),
        auto,
      );
  setTypeDef(expr, auto);
  return expr;
};

export const getVarsAccessor = (module: Module, varDefs: Dict<TypeDef>): VarsAccessor => {
  return new Proxy(varSetExpression(module, varDefs) as any, {
    get(_target: any, prop: string) {
      return varGet(module, varDefs, prop);
    },
  });
};
