import { ExpressionRef, Module } from 'binaryen';
import { VarDefs, Expression, TypeDef, Dict, VarsAccessor, Accessor } from './types';
import { asType, setTypeDef, getTypeDef } from './typedefs';
import { isPrimitive } from './utils';
import { makeTupleProxy, stripTupleProxy } from './tuples';
import { applyTypeDef } from './literals';

export const variableGet = (
  module: Module,
  varDefs: VarDefs,
  globalVarDefs: Dict<TypeDef>,
  name: string,
) => {
  if (!(name in varDefs) && !(name in globalVarDefs)) {
    throw new Error(`Getter: unknown variable '${name}'`);
  }
  let expr, typeDef;
  if (name in varDefs) {
    typeDef = varDefs[name];
    const index = Object.keys(varDefs).lastIndexOf(name);
    expr = module.local.get(index, asType(typeDef));
  } else {
    typeDef = globalVarDefs[name];
    expr = module.global.get(name, asType(typeDef));
  }
  setTypeDef(expr, typeDef);
  return expr;
};

export const varGet = (
  module: Module,
  varDefs: VarDefs,
  globalVarDefs: Dict<TypeDef>,
  name: string,
) => {
  if (!(name in varDefs) && !(name in globalVarDefs)) {
    throw new Error(`Getter: unknown variable '${name}'`);
  }
  let expr, typeDef;
  if (name in varDefs) {
    typeDef = varDefs[name];
    const index = Object.keys(varDefs).lastIndexOf(name);
    expr = module.local.get(index, asType(typeDef));
  } else {
    typeDef = globalVarDefs[name];
    expr = module.global.get(name, asType(typeDef));
  }
  setTypeDef(expr, typeDef);
  return isPrimitive<ExpressionRef>(typeDef) ? expr : makeTupleProxy(module, expr, typeDef);
};

export const varSet = (
  module: Module,
  varDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
  name: string,
  expression: Expression,
): ExpressionRef => {
  let isGlobal = false;
  let typeDef: TypeDef | undefined = varDefs[name];
  if (typeDef == null) {
    typeDef = globalVarDefs[name];
    isGlobal = typeDef != null;
  }
  const expr = applyTypeDef(module, stripTupleProxy(expression), typeDef);
  if (typeDef == null) {
    typeDef = getTypeDef(expr);
    varDefs[name] = typeDef;
  }
  if (isGlobal) {
    return module.global.set(name, expr);
  } else {
    const index = Object.keys(varDefs).lastIndexOf(name);
    return module.local.set(index, expr);
  }
};

export const accessor = (
  module: Module,
  localVarDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
  name: string,
) => {
  const accessorFunc = (expression?: Expression): any => {
    return expression == null
      ? varGet(module, localVarDefs, globalVarDefs, name)
      : varSet(module, localVarDefs, globalVarDefs, name, expression);
  };
  return new Proxy<Accessor>(accessorFunc as Accessor, {
    get(_target: any, subProp: number | string) {
      const varDefs = { ...globalVarDefs, ...localVarDefs };
      const typeDef = varDefs[name];
      if (typeDef == null) {
        throw new Error(`Variable ${name} has not yet been initialized`);
      }
      if (isPrimitive<ExpressionRef>(typeDef)) {
        throw new Error(`Cannot index a primitive value`);
      } else {
        const expr = variableGet(module, localVarDefs, globalVarDefs, name);
        if (Array.isArray(typeDef)) {
          const index = subProp as number;
          if (index >= typeDef.length) {
            throw new Error(`Max tuple index should be ${typeDef.length} but received ${subProp}`);
          }
          const valueExpr = module.tuple.extract(expr, index);
          setTypeDef(valueExpr, typeDef[index]);
          return valueExpr;
        } else {
          const typeDefDict = typeDef;
          const index = Object.keys(typeDef).indexOf(subProp as string);
          if (index < 0) {
            throw new Error(`Could not find ${subProp} in record`);
          }
          const valueExpr = module.tuple.extract(expr, index);
          setTypeDef(valueExpr, typeDefDict[subProp]);
          return valueExpr;
        }
      }
    },
  });
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
