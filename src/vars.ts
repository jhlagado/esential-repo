import { ExpressionRef, Module } from 'binaryen';
import { VarDefs, Expression, TypeDef, Dict } from './types';
import { makeTupleProxy, stripTupleProxy } from './tuples';
import { local } from './core';
import { inferTypeDef, asType, setTypeDef, getTypeDef } from './typedefs';

export const getAssignable = (module: Module) =>  (expression: Expression): ExpressionRef => {
  const stripped = stripTupleProxy(expression);
  if (Number.isInteger(stripped)) {
    return stripped as ExpressionRef;
  } else {
    const exprArray = Array.isArray(stripped)
      ? stripped
      : Object.keys(stripped)
          .sort()
          .map(key => (stripped as Dict<ExpressionRef>)[key]);
    return module.tuple.make(exprArray);
  }
};

export const getter = (module: Module)=> (varDefs: VarDefs, prop: string) => {
  if (!(prop in varDefs)) {
    throw new Error(`Getter: unknown variable '${prop}'`);
  }
  const varNames = Object.keys(varDefs);
  const index = varNames.lastIndexOf(prop);
  const typeDef = varDefs[prop];
  const type = asType(typeDef);
  const expr = local.get(index, type);
  setTypeDef(expr, typeDef);
  return Number.isInteger(typeDef) ? expr : makeTupleProxy(module, expr, typeDef);
};

export const setter = (
  module: Module,
  varDefs: VarDefs,
  prop: string,
  expression: Expression,
): ExpressionRef => {
  const expr = getAssignable(module)(expression) as ExpressionRef;
  let typeDef = varDefs[prop];
  if (typeDef == null) {
    typeDef = inferTypeDef(stripTupleProxy(expression));
    varDefs[prop] = typeDef;
    setTypeDef(expr, typeDef);
  } else {
    const exprTypeDef = getTypeDef(expr);
    if (asType(exprTypeDef) !== asType(typeDef)) {
      throw new Error(`Wrong assignment type, expected ${typeDef} and got ${exprTypeDef}`);
    }
  }
  const index = Object.keys(varDefs).lastIndexOf(prop);
  return local.set(index, expr);
};

export const getVarsProxy = (module: Module, varDefs: Dict<TypeDef>, bodyItems: ExpressionRef[]) =>
  new Proxy(varDefs, {
    get: getter(module),
    set(varDefs: VarDefs, prop: string, expression: Expression) {
      const expr = setter(module, varDefs, prop, expression);
      bodyItems.push(expr);
      return true;
    },
  });
