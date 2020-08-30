import { Dict, TypeDef, Var } from './types';
import { ExpressionRef, createType } from 'binaryen';
import { makeTupleProxy, stripTupleProxy } from './tuples';
import { local, tuple } from './core';

export const makeDictProxy = (
  receiver: Dict<TypeDef>,
  varNames: string[],
  bodyItems: ExpressionRef[] = [],
): Var => {
  return new Proxy(receiver, {
    get(target: any, prop: string) {
      if (!(prop in target)) {
        throw `Unknown variable '${prop}'`;
      }
      const index = varNames.indexOf(prop);
      const typeDef = target[prop];
      return Array.isArray(typeDef)
        ? makeTupleProxy(local.get(index, createType(typeDef)), typeDef)
        : local.get(index, typeDef);
    },
    set(
      target: any,
      prop: string,
      expressionRef: ExpressionRef | ExpressionRef[],
    ) {
      const index = varNames.indexOf(prop);
      if (index < 0) {
        throw `Unknown variable '${prop}'`;
      }
      if (Array.isArray(expressionRef)) {
        bodyItems.push(local.set(index, tuple.make(expressionRef)));
      } else {
        bodyItems.push(local.set(index, stripTupleProxy(expressionRef)));
      }
      return true;
    },
    apply(target: any) {
      return target;
    },
  });
};
