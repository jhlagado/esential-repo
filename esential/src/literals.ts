import { ExpressionRef, Type, i32, i64, f32, f64, none, Module, getExpressionType, auto } from 'binaryen';
import { asType, getTypeDef, setTypeDef } from './type-util';
import { Dict, Expression, TypeDef } from './types';
import { asArray, isPrim } from './util';
import { resolveExpression } from './util';

export const asLiteral = (module: Module, value: number, type?: Type): ExpressionRef => {
  const opDict = {
    [i32]: module.i32,
    [i64]: module.i64,
    [f32]: module.f32,
    [f64]: module.f64,
  };
  if (type == null || type === auto) type = Number.isInteger(value) ? i32 : f32;
  if (type in opDict) {
    // .d.ts error in type definition for i64.const
    const expr = (opDict[type] as any).const(value);
    setTypeDef(expr, type); // for primitives type === typeDef
    return expr;
  }
  throw new Error(`Can only use primitive types in val, not ${type}`);
};

export const literalizePrim = (
  module: Module,
  expr: ExpressionRef,
  typeDef?: TypeDef,
): ExpressionRef => {
  if (typeDef === none) return expr;
  const exprTypeDef = getTypeDef(getExpressionType(expr), false);
  if (exprTypeDef === none) {
    return asLiteral(module, expr, asType(typeDef));
  } else {
    if (typeDef != null && asType(typeDef) !== asType(exprTypeDef)) {
      throw new Error(`Type mismatch: expected ${typeDef} but got ${exprTypeDef}`);
    }
    return expr;
  }
};

export const literalize = (
  module: Module,
  expression: Expression,
  typeDef?: TypeDef,
): ExpressionRef => {
  const resolved = resolveExpression(expression);
  if (isPrim<ExpressionRef>(resolved)) {
    return literalizePrim(module, resolved, typeDef);
  } else {
    const typeArray = typeDef ? asArray<Type>(typeDef as any) : [];
    const exprArray = asArray<ExpressionRef>(resolved).map((expr, index) => {
      const expr1 = literalizePrim(module, expr, typeArray[index]);
      if (typeArray[index] == null) {
        typeArray[index] = getExpressionType(expr1) as Type;
      }
      return expr1;
    });
    const tupleExpr = module.tuple.make(exprArray);
    let typeDef1: TypeDef = Array.isArray(resolved)
      ? typeArray
      : Object.keys(resolved)
          .sort()
          .reduce((acc, key, index) => {
            (acc as Dict<Type>)[key] = typeArray[index];
            return acc;
          }, {} as TypeDef);
    setTypeDef(tupleExpr, typeDef1);
    return tupleExpr;
  }
};
