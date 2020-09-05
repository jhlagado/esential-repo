import { ExpressionRef } from 'binaryen';
import { TypeDef, TupleObj, Expression, Dict } from './types';
import { tuple } from './core';
import { setType, asType } from './utils';

const tupleProxies = new Map();

export const makeTupleProxy = (
  expr: ExpressionRef,
  typeDef: TypeDef,
): TupleObj => {
  const boxed = new Number(expr);
  const proxy = new Proxy(boxed, {
    get(_target: any, prop: number | string) {
      if (Number.isInteger(typeDef)) {
        throw new Error(`Cannot index a primitive value`);
      } else if (Array.isArray(typeDef)) {
        const index = prop as number;
        if (index >= typeDef.length) {
          throw new Error(
            `Max tuple index should be ${typeDef.length} but received ${prop}`,
          );
        }
        const valueExpr = tuple.extract(expr, index);
        const valueType = asType(typeDef[index]);
        setType(valueExpr, valueType)
        return valueExpr;
      } else {
        const typeDefDict = typeDef as Dict<TypeDef>
        const index = Object.keys(typeDef).indexOf(prop as string);
        if (index < 0) {
          throw new Error(`Could not find ${prop} in record`);
        }
        const valueExpr = tuple.extract(expr, index);
        const valueType = asType(typeDefDict[prop]);
        setType(valueExpr, valueType)
        return valueExpr;
      }
    },
  });
  tupleProxies.set(proxy, expr);
  return proxy;
};

export const stripTupleProxy = (expr: Expression): Expression => {
  return tupleProxies.has(expr as any) ? tupleProxies.get(expr) : expr;
};
