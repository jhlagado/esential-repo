import { ExpressionRef, expandType } from 'binaryen';
import { VarsDefs, Expression, TypeDef, Dict } from './types';
import { makeTupleProxy, stripTupleProxy } from './tuples';
import { local, tuple } from './core';
import { getType, asType, setType } from './utils';

export const getAssignable = (
  expression: Expression,
  typeDef: TypeDef,
): ExpressionRef => {
  const stripped = stripTupleProxy(expression);
  if (Number.isInteger(stripped)) {
    const exprType = getType(stripped as ExpressionRef);
    if (exprType != null) {
      if (exprType !== asType(typeDef)) {
        new Error(
          `Type Mismatch: Expected ${typeDef} instead of ${expandType(
            exprType,
          )}`,
        );
      }
    }
    return stripped as ExpressionRef;
  } else if (Array.isArray(stripped)) {
    if (!Array.isArray(typeDef)) {
      throw new Error(`Tuple type expected`);
    }
    return tuple.make(stripped);
  } else {
    if (typeof typeDef !== 'object') {
      throw new Error(`Record type expected`);
    }
    const array = Object.keys(typeDef).map(key => {
      if (!(key in (stripped as object))) {
        throw new Error(`Could not find ${key} in record`);
      }
      return (stripped as Dict<ExpressionRef>)[key];
    });
    return tuple.make(array);
  }
};

export const getter = (varDefs: VarsDefs, prop: string) => {
  if (!(prop in varDefs)) {
    throw new Error(`Getter: unknown variable '${prop}'`);
  }
  const varNames = Object.keys(varDefs);
  const index = varNames.lastIndexOf(prop);
  const typeDef = varDefs[prop];
  const type = asType(typeDef);
  const expr = local.get(index, type);
  setType(expr, type);
  return Number.isInteger(typeDef) ? expr : makeTupleProxy(expr, typeDef);
};

export const setter = (
  varDefs: VarsDefs,
  prop: string,
  expression: Expression,
): ExpressionRef => {
  if (!(prop in varDefs)) {
    throw new Error(`Setter: unknown variable '${prop}'`);
  }
  const varNames = Object.keys(varDefs);
  const index = varNames.lastIndexOf(prop);
  const typeDef = varDefs[prop];
  const type = asType(typeDef);
  const expr = getAssignable(expression, typeDef);
  const exprType = getType(expr);
  if (exprType != null) {
    if (exprType !== type) {
      new Error(
        `Type Mismatch: Expected ${typeDef} instead of ${expandType(exprType)}`,
      );
    }
  }
  return local.set(index, expr);
};
