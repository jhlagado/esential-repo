import { Dict, TypeDef, Var } from './types';
import { ExpressionRef, createType } from 'binaryen';
import { makeTupleProxy } from './tuples';
import { local } from './core';
import { asTypeArray, assignment } from './utils';

export const makeVarsProxy = (
  variables: Dict<TypeDef>,
  bodyItems: ExpressionRef[] = [],
): Var => {
  const varNames = Object.keys(variables);
  return new Proxy(variables, {
    get(target: any, prop: string) {
      if (!(prop in target)) {
        throw new Error(`Unknown variable '${prop}'`);
      }
      const index = varNames.lastIndexOf(prop);
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
      const index = varNames.lastIndexOf(prop);
      bodyItems.push(local.set(index,assignment(expressionRef1,target[prop])));
      return true;
    },
  });
};
