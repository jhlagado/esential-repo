import { ExpressionRef, Module } from 'binaryen';
import { Expression, TypeDef, TupleObj, Accessor } from './types';
import { setTypeDef } from './typedefs';
import { isPrimitive } from './utils';

const tupleProxies = new Map();

export const isTupleProxy = (expr: Expression) => tupleProxies.has(expr);

export const stripTupleProxy = (expr: Expression | Accessor): Expression => {
  const expr1 = typeof expr === 'function' ? expr() : expr;
  return isTupleProxy(expr1 as any) ? tupleProxies.get(expr1) : expr1;
};

export const getAssignable = (module: Module, expression: Expression): ExpressionRef => {
  const stripped = expression;
  if (isPrimitive<ExpressionRef>(stripped)) {
    return stripped;
  } else {
    const exprArray = Array.isArray(stripped)
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
      } else if (Array.isArray(typeDef)) {
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
