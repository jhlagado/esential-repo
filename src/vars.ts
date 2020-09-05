import { VarsDefs, Expression, TypeDef } from './types';
import { ExpressionRef, createType } from 'binaryen';
import { makeTupleProxy, stripTupleProxy } from './tuples';
import { local, tuple } from './core';
import { asTypeArray } from './utils';

export const getAssignable = (
  expression: Expression,
  typeDef: TypeDef,
): ExpressionRef => {
  const expr = stripTupleProxy(expression);
  if (Number.isInteger(expr)) {
    return expr;
  } else if (Array.isArray(expr)) {
    if (!Array.isArray(typeDef)) {
      throw new Error(`Tuple type expected`);
    }
    return tuple.make(expr);
  } else {
    if (typeof typeDef !== 'object') {
      throw new Error(`Record type expected`);
    }
    const array = Object.keys(typeDef).map(key => {
      if (!(key in expr)) {
        throw new Error(`Could not find ${key} in record`);
      }
      return expr[key];
    });
    return tuple.make(array);
  }
};

export const getter = (varDefs: VarsDefs, prop: string) => {
  if (!(prop in varDefs)) {
    throw new Error(`Unknown variable '${prop}'`);
  }
  const varNames = Object.keys(varDefs);
  const index = varNames.lastIndexOf(prop);
  const typeDef = varDefs[prop];
  return Number.isInteger(typeDef)
    ? local.get(index, typeDef as number)
    : makeTupleProxy(
        local.get(index, createType(asTypeArray(typeDef))),
        typeDef,
      );
};

export const setter = (
  varDefs: VarsDefs,
  prop: string,
  expressionRef: Expression,
): ExpressionRef => {
  const varNames = Object.keys(varDefs);
  const index = varNames.lastIndexOf(prop);
  return local.set(index, getAssignable(expressionRef, varDefs[prop]));
};

