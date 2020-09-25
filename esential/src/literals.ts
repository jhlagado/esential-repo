import { ExpressionRef, Type, i32, i64, f32, f64, none, Module } from 'binaryen';
import { asType, getTypeDef, setTypeDef } from './typedefs';
import { Dict, Expression, TypeDef } from './types';
import { asArray, isPrim } from './utils';
import { resolveAccessors } from './accessors';

export const asLiteral = (module: Module, value: number, type: Type = i32): ExpressionRef => {
  const opDict = {
    [i32]: module.i32,
    [i64]: module.i64,
    [f32]: module.f32,
    [f64]: module.f64,
  };
  if (type in opDict) {
    // .d.ts error in type definition for i64.const
    const expr = (opDict[type] as any).const(value);
    setTypeDef(expr, type); // for primitives type === typeDef
    return expr;
  }
  throw new Error(`Can only use primitive types in val, not ${type}`);
};

export const applyTypeDefPrimitive = (
  module: Module,
  expr: ExpressionRef,
  typeDef?: TypeDef,
): ExpressionRef => {
  if (typeDef === none) {
    return expr;
  }
  const exprTypeDef = getTypeDef(expr, false);
  if (exprTypeDef === none) {
    return asLiteral(module, expr, asType(typeDef || i32));
  } else {
    if (typeDef != null && asType(typeDef) !== asType(exprTypeDef)) {
      throw new Error(`Type mismatch: expected ${typeDef} but got ${exprTypeDef}`);
    }
    return expr;
  }
};

export const applyTypeDef = (
  module: Module,
  expression1: Expression,
  typeDef?: TypeDef,
): ExpressionRef => {
  const expression = resolveAccessors(expression1);
  if (isPrim<ExpressionRef>(expression)) {
    return applyTypeDefPrimitive(module, expression, typeDef);
  } else {
    const typeArray = typeDef ? asArray<Type>(typeDef as any) : [];
    const exprArray = asArray<ExpressionRef>(expression).map((expr, index) => {
      const expr1 = applyTypeDefPrimitive(module, expr, typeArray[index]);
      if (typeArray[index] == null) {
        typeArray[index] = getTypeDef(expr1) as number;
      }
      return expr1;
    });
    const tupleExpr = module.tuple.make(exprArray);
    let typeDef1: TypeDef = Array.isArray(expression)
      ? typeArray
      : Object.keys(expression)
          .sort()
          .reduce((acc, key, index) => {
            (acc as Dict<Type>)[key] = typeArray[index];
            return acc;
          }, {} as TypeDef);
    setTypeDef(tupleExpr, typeDef1);
    return tupleExpr;
  }
};

