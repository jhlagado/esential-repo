import { Dict, TypeDef, Var } from './types';
import { ExpressionRef, createType } from 'binaryen';
import { makeTupleProxy, stripTupleProxy } from './tuples';
import { local, tuple } from './core';
import { asTypeArray } from './utils';

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
      const expressionRef = stripTupleProxy(expressionRef1);
      const index = varNames.indexOf(prop);
      if (index < 0) {
        throw `Unknown variable '${prop}'`;
      }
      if (typeof expressionRef === 'object') {
        const typeDef = target[prop];
        if (typeof typeDef !== 'object') {
          throw `Can only accept primitive types`;
        }
        if (Array.isArray(expressionRef)) {
          bodyItems.push(local.set(index, tuple.make(expressionRef)));
        } else {
          const array = Object.keys(typeDef).map(key => {
            if (!(key in expressionRef)) {
              throw `Could not find ${key} in record`;
            }
            return expressionRef[key];
          });
          bodyItems.push(local.set(index, tuple.make(array)));
        }
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
