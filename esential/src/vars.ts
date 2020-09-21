import { auto, ExpressionRef, Module, none } from 'binaryen';
import { VarDefs, Expression, TypeDef, Dict, VarsAccessor } from './types';
import { inferTypeDef, asType, setTypeDef, getTypeDef } from './typedefs';
import { isArray, isPrimitive } from './utils';
import { makeTupleProxy, getAssignable, stripTupleProxy } from './tuples';

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
  const expr = getAssignable(module)(expression) as ExpressionRef;
  let isGlobal = false;
  let typeDef = varDefs[prop];
  if (typeDef == null) {
    typeDef = globalVarDefs[prop];
    isGlobal = true;
  }
  if (typeDef == null) {
    typeDef = inferTypeDef(stripTupleProxy(expression));
    varDefs[prop] = typeDef;
    setTypeDef(expr, typeDef);
    isGlobal = false;
  } else {
    const exprTypeDef = getTypeDef(expr, false);
    if (exprTypeDef !== none && asType(exprTypeDef) !== asType(typeDef)) {
      throw new Error(`Wrong assignment type, expected ${typeDef} and got ${exprTypeDef}`);
    }
  }
  if (isGlobal) {
    return module.global.set(prop, expr);
  } else {
    const index = Object.keys(varDefs).lastIndexOf(prop);
    return module.local.set(index, expr);
  }
};

export const blockExpressionItem = (
  module: Module,
  varDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
) => (expression: Expression) => {
  const expr: ExpressionRef = isPrimitive<ExpressionRef>(expression)
    ? expression
    : module.block(
        null as any,
        isArray<ExpressionRef>(expression)
          ? expression
          : Object.entries(expression).map(([prop, expr]) =>
              varSet(module, varDefs, globalVarDefs, prop, expr),
            ),
        auto,
      );
  setTypeDef(expr, auto);
  return expr;
};

export const blockExpression = (
  module: Module,
  varDefs: Dict<TypeDef>,
  globalVarDefs: Dict<TypeDef>,
) => (...blockExprs: Expression[]) => {
  const expr = module.block(
    null as any,
    blockExprs.map(blockExpressionItem(module, varDefs, globalVarDefs)),
  );
  setTypeDef(expr, auto);
  return expr;
};

// export const getVarsAccessor = (
//   module: Module,
//   varDefs: Dict<TypeDef>,
//   globalVarDefs: Dict<TypeDef>,
// ): VarsAccessor => {
//   return new Proxy(blockExpression(module, varDefs, globalVarDefs) as any, {
//     get(_target: any, prop: string) {
//       return varGet(module, varDefs, globalVarDefs, prop);
//     },
//   });
// };

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
  return new Proxy(blockExpression(module, varDefs, globalVarDefs) as any, {
    get(_target: any, prop: string) {
      return accessor(module, varDefs, globalVarDefs, prop);
    },
  });
};
