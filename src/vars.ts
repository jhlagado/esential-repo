import { ExpressionRef, expandType, createType } from 'binaryen';
import { VarsDefs, Expression, TypeDef, Dict } from './types';
import { makeTupleProxy, stripTupleProxy } from './tuples';
import { local, tuple } from './core';
import { getType, asType, setType } from './utils';

export const getAssignable = (
  expression: Expression,
  typeDef: TypeDef,
): ExpressionRef => {
  const stripped = stripTupleProxy(expression);
  const type = asType(typeDef);
  if (Number.isInteger(stripped)) {
    const expr = stripped as ExpressionRef;
    const exprType = getType(expr, type);
    if (exprType !== type) {
      new Error(
        `Type Mismatch: Expected ${typeDef} instead of ${expandType(exprType)}`,
      );
    }
    return expr;
  } else if (Array.isArray(stripped)) {
    const exprArray = stripped;
    const exprTypeDef = exprArray.map(item => getType(item, type));
    const exprType = createType(exprTypeDef);
    if (exprType !== type) {
      new Error(
        `Type Mismatch: Expected ${typeDef} instead of ${expandType(exprType)}`,
      );
    }
    const expr = tuple.make(stripped);
    setType(expr, exprType);
    return expr;
  } else {
    const exprDict = stripped as Dict<ExpressionRef>;
    const exprValues = Object.keys(typeDef).map(key => {
      if (!(key in exprDict)) {
        throw new Error(`Could not find ${key} in record`);
      }
      return exprDict[key];
    });
    const exprTypeDef = Object.values(typeDef);
    const exprType = createType(exprTypeDef);
    if (exprType !== type) {
      new Error(
        `Type Mismatch: Expected ${typeDef} instead of ${expandType(exprType)}`,
      );
    }
    const expr = tuple.make(exprValues);
    setType(expr, type);
    return expr;
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
  const assignable = getAssignable(expression, typeDef) as ExpressionRef;
  return local.set(index, assignable);
};
