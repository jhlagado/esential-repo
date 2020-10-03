import { ExpressionRef, getExpressionType, Module } from 'binaryen';
import { Expression, TypeDef, Dict, Accessor } from './types';
import { asType, setTypeDef, getTypeDef } from './type-util';
import { isPrim } from './util';
import { literalize } from './literals';
import { getModule } from './module';

export const getGetter = (
  varDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
  name: string,
) => () => {
  if (!(name in varDefs) && !(name in globalVarDefs)) {
    throw new Error(`Getter: unknown variable '${name}'`);
  }
  let expr, typeDef;
  const module = getModule();
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

export const getSetter = (
  varDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
  name: string,
) => (expression: Expression): ExpressionRef => {
  let isGlobal = false;
  let typeDef: TypeDef | undefined = varDefs[name];
  if (typeDef == null) {
    typeDef = globalVarDefs[name];
    isGlobal = typeDef != null;
  }
  const module = getModule();
  const expr = literalize(expression, typeDef);
  if (typeDef == null) {
    typeDef = getTypeDef(getExpressionType(expr));
    varDefs[name] = typeDef;
  }
  if (isGlobal) {
    const gexpr = module.global.set(name, expr);
    setTypeDef(gexpr, typeDef);
    return gexpr;
  } else {
    const index = Object.keys(varDefs).lastIndexOf(name);
    const gexpr = module.local.set(index, expr);
    setTypeDef(gexpr, typeDef);
    return gexpr;
  }
};

const getAccessor = (
  localVarDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
  name: string,
) => {
  const getter = getGetter(localVarDefs, globalVarDefs, name);
  const setter = getSetter(localVarDefs, globalVarDefs, name);
  return (expression?: Expression): any => (expression == null ? getter() : setter(expression));
};

export const accessor = (
  localVarDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
  name: string,
) => {
  const accessor = getAccessor(localVarDefs, globalVarDefs, name);

  return new Proxy<Accessor>(accessor as Accessor, {
    get(_target: any, prop: number | string) {
      const varDefs = { ...globalVarDefs, ...localVarDefs };
      const typeDef = varDefs[name];
      if (typeDef == null) {
        throw new Error(`Variable ${name} has not yet been initialized`);
      }
      if (isPrim<ExpressionRef>(typeDef)) {
        throw new Error(`Cannot index a primitive value`);
      } else {
        const module = getModule();
        const expr = accessor();
        if (Array.isArray(typeDef)) {
          const index = prop as number;
          if (index >= typeDef.length) {
            throw new Error(`Max tuple index should be ${typeDef.length} but received ${prop}`);
          }
          const valueExpr = module.tuple.extract(expr, index);
          setTypeDef(valueExpr, typeDef[index]);
          return valueExpr;
        } else {
          const typeDefDict = typeDef;
          const index = Object.keys(typeDef).indexOf(prop as string);
          if (index < 0) {
            throw new Error(`Could not find ${prop} in record`);
          }
          const valueExpr = module.tuple.extract(expr, index);
          setTypeDef(valueExpr, typeDefDict[prop]);
          return valueExpr;
        }
      }
    },
  });
};

export const getVarsAccessor = (
  varDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
) => {
  const proxy = new Proxy(
    {},
    {
      get(_target: any, prop: string) {
        return accessor(varDefs, globalVarDefs, prop);
      },
    },
  );
  return proxy;
};
