import { auto, ExpressionRef, Module } from 'binaryen';
import { VarDefs, Expression, TypeDef, Dict, VarsAccessor } from './types';
import { makeTupleProxy, stripTupleProxy } from './tuples';
import { inferTypeDef, asType, setTypeDef, getTypeDef } from './typedefs';
import { getAssignable } from './funcs-utils';

export const getter = (module: Module, varDefs: VarDefs, prop: string) => {
  if (!(prop in varDefs)) {
    throw new Error(`Getter: unknown variable '${prop}'`);
  }
  const varNames = Object.keys(varDefs);
  const index = varNames.lastIndexOf(prop);
  const typeDef = varDefs[prop];
  const type = asType(typeDef);
  const expr = module.local.get(index, type);
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
  return module.local.set(index, expr);
};

export const getVarsAccessor = (module: Module, varDefs: Dict<TypeDef>): VarsAccessor => {
  const f = (assignDict: Dict<ExpressionRef>) => {
    const expr = module.block(
      null as any,
      Object.entries(assignDict).map(([prop, expression]) =>
        setter(module, varDefs, prop, expression),
      ),
      auto,
    );
    setTypeDef(expr, auto);
    return expr;
  };
  return new Proxy(f as any, {
    get(_target: any, prop: string) {
      return getter(module, varDefs, prop);
    },
  });
};
