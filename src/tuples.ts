import { ExpressionRef } from "binaryen";
import { TypeDef, TupleObj } from "./types";
import { tuple } from "./core";

const tupleProxies = new WeakSet();

export const makeTupleProxy = (
  expressionRef: ExpressionRef,
  typeDef: TypeDef,
): TupleObj => {
  const proxy = new Proxy(new Number(expressionRef), {
    get(target: any, prop: number | string) {
      if (prop === 'valueOf') {
        return () => expressionRef;
      } else if (Array.isArray(typeDef)) {
        const index = prop as number;
        if (index >= typeDef.length) {
          throw `Max tuple index should be ${typeDef.length} but received ${prop}`;
        }
        return tuple.extract(expressionRef, index);
      } else {
        throw `Cannot index a primitive value`;
      }
    },
  });
  tupleProxies.add(proxy);
  return proxy;
};

export const stripTupleProxy = (expressionRef: any) => {
  return tupleProxies.has(expressionRef as any)
    ? expressionRef.valueOf()
    : expressionRef;
};

