import { ExpressionRef, Module } from 'binaryen';
import { VarDefs, Expression, TypeDef, Dict, VarsAccessor } from './types';
import { asType, setTypeDef, getTypeDef } from './typedefs';
import { isPrimitive } from './utils';
import { makeTupleProxy } from './tuples';
import { applyTypeDef } from './literals';

export const varGet = (
  module: Module,
  varDefs: VarDefs,
  globalVarDefs: Dict<TypeDef>,
  prop: string,
) => {
  if (!(prop in varDefs) && !(prop in globalVarDefs)) {
    throw new Error(`Getter: unknown variable '${prop}'`);
  }
  let expr, typeDef;
  if (prop in varDefs) {
    typeDef = varDefs[prop];
    const index = Object.keys(varDefs).lastIndexOf(prop);
    expr = module.local.get(index, asType(typeDef));
  } else {
    typeDef = globalVarDefs[prop];
    expr = module.global.get(prop, asType(typeDef));
  }
  setTypeDef(expr, typeDef);
  return isPrimitive<ExpressionRef>(typeDef) ? expr : makeTupleProxy(module, expr, typeDef);
};

export const varSet = (
  module: Module,
  varDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
  prop: string,
  expression: Expression,
): ExpressionRef => {
  let isGlobal = false;
  let typeDef: TypeDef | undefined = varDefs[prop];
  if (typeDef == null) {
    typeDef = globalVarDefs[prop];
    isGlobal = typeDef != null;
  }
  const expr = applyTypeDef(module, expression, typeDef);
  if (typeDef == null) {
    typeDef = getTypeDef(expr);
    varDefs[prop] = typeDef;
  }
  if (isGlobal) {
    return module.global.set(prop, expr);
  } else {
    const index = Object.keys(varDefs).lastIndexOf(prop);
    return module.local.set(index, expr);
  }
};

export const accessor = (
  module: Module,
  varDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
  prop: string,
) => (expression?: Expression): any => {
  return expression == null
    ? varGet(module, varDefs, globalVarDefs, prop)
    : varSet(module, varDefs, globalVarDefs, prop, expression);
};

export const getVarsAccessor = (
  module: Module,
  varDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
): VarsAccessor => {
  return new Proxy(
    {},
    {
      get(_target: any, prop: string) {
        return accessor(module, varDefs, globalVarDefs, prop);
      },
    },
  );
};
