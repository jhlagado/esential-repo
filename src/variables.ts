import { Dict, TypeDef, Var } from './types';
import { ExpressionRef, createType } from 'binaryen';
import { makeTupleProxy } from './tuples';
import { local } from './core';
import { asTypeArray, assignment } from './utils';

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
      return Number.isInteger(typeDef)
        ? local.get(index, typeDef)
        : makeTupleProxy(
            local.get(index, createType(asTypeArray(typeDef))),
            typeDef,
          );
    },
    set(
      target: any,
      prop: string,
      expressionRef1: ExpressionRef | ExpressionRef[] | Dict<ExpressionRef>,
    ) {
      const index = varNames.indexOf(prop);
      bodyItems.push(local.set(index,assignment(expressionRef1,target[prop])));
      return true;
    },
    apply(target: any) {
      return target;
    },
  });
};
