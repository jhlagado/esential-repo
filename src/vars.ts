import { auto, ExpressionRef, Module, none } from 'binaryen';
import { VarDefs, Expression, TypeDef, Dict, VarsAccessor } from './types';
import { inferTypeDef, asType, setTypeDef, getTypeDef } from './typedefs';
import { isArray, isPrimitive } from './utils';
import { makeTupleProxy, getAssignable, stripTupleProxy } from './tuples';

export const varGet = (module: Module, varDefs: VarDefs, prop: string) => {
  if (!(prop in varDefs)) {
    throw new Error(`Getter: unknown variable '${prop}'`);
  }
  const varNames = Object.keys(varDefs);
  const index = varNames.lastIndexOf(prop);
  const typeDef = varDefs[prop];
  const type = asType(typeDef);
  const expr = module.local.get(index, type);
  setTypeDef(expr, typeDef);
  return isPrimitive<ExpressionRef>(typeDef) ? expr : makeTupleProxy(module, expr, typeDef);
};

export const varSet = (
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
    const exprTypeDef = getTypeDef(expr, false);
    if (exprTypeDef !== none && asType(exprTypeDef) !== asType(typeDef)) {
      throw new Error(`Wrong assignment type, expected ${typeDef} and got ${exprTypeDef}`);
    }
  }
  const index = Object.keys(varDefs).lastIndexOf(prop);
  return module.local.set(index, expr);
};

export const varSetExpression = (module: Module, varDefs: Dict<TypeDef>) => (value: Expression) => {
  const expr: ExpressionRef = isPrimitive<ExpressionRef>(value)
    ? (value as number)
    : module.block(
        null as any,
        isArray<ExpressionRef>(value)
          ? value.map(expr => expr)
          : Object.entries(value).map(([prop, expr]) => varSet(module, varDefs, prop, expr)),
        auto,
      );
  setTypeDef(expr, auto);
  return expr;
};

export const getVarsAccessor = (module: Module, varDefs: Dict<TypeDef>): VarsAccessor => {
  return new Proxy(varSetExpression(module, varDefs) as any, {
    get(_target: any, prop: string) {
      return varGet(module, varDefs, prop);
    },
  });
};
