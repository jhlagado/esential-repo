import { ExpressionRef } from 'binaryen';
import { VarDefs, Expression, TypeDef, Dict } from './types';
import { makeTupleProxy, stripTupleProxy } from './tuples';
import { local, tuple } from './core';
import { getType, asType, setType, setTypeDef, getTypeDef } from './utils';

export const inferTypeDef = (expression: Expression): TypeDef => {
  const stripped = stripTupleProxy(expression);
  if (Number.isInteger(stripped)) {
    const expr = stripped as ExpressionRef;
    return getTypeDef(expr);
  } else {
    const exprArray = Array.isArray(stripped)
      ? stripped
      : Object.keys(stripped)
          .sort()
          .map(key => (stripped as Dict<ExpressionRef>)[key]);
    return exprArray.map(getType);
  }
};

export const getAssignable = (expression: Expression): ExpressionRef => {
  const stripped = stripTupleProxy(expression);
  if (Number.isInteger(stripped)) {
    return stripped as ExpressionRef;
  } else {
    const exprArray = Array.isArray(stripped)
      ? stripped
      : Object.keys(stripped)
          .sort()
          .map(key => (stripped as Dict<ExpressionRef>)[key]);
    return tuple.make(exprArray);
  }
};

export const getter = (varDefs: VarDefs, prop: string) => {
  if (!(prop in varDefs)) {
    throw new Error(`Getter: unknown variable '${prop}'`);
  }
  const varNames = Object.keys(varDefs);
  const index = varNames.lastIndexOf(prop);
  const typeDef = varDefs[prop];
  const type = asType(typeDef);
  const expr = local.get(index, type);
  setTypeDef(expr, typeDef);
  return Number.isInteger(typeDef) ? expr : makeTupleProxy(expr, typeDef);
};

export const setter = (
  varDefs: VarDefs,
  prop: string,
  expression: Expression,
): ExpressionRef => {
  const assignable = getAssignable(expression) as ExpressionRef;
  let typeDef = varDefs[prop];
  if (typeDef == null) {
    typeDef = inferTypeDef(expression);
    varDefs[prop] = typeDef;
    setTypeDef(assignable, typeDef);
  }
  const index = Object.keys(varDefs).lastIndexOf(prop);
  return local.set(index, assignable);
};
