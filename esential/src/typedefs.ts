import { Dict, Expression, TypeDef } from './types';
import { ExpressionRef, Type, createType, none, Module, i32, f32, f64, i64 } from 'binaryen';
import { asArray, asDict, isArray, isPrimitive } from './utils';

const expressionTypeDefs = new Map<ExpressionRef, TypeDef>();

export const setTypeDef = (expr: ExpressionRef, typeDef: TypeDef) => {
  expressionTypeDefs.set(expr, typeDef);
};

export const getTypeDef = (expr: ExpressionRef, failThrow = true): TypeDef => {
  if (expressionTypeDefs.has(expr)) {
    return expressionTypeDefs.get(expr) as Type;
  }
  if (failThrow) {
    throw new Error(`Could not find typeDef for ${expr}`);
  } else {
    return none;
  }
};

export const asType = (typeDef: TypeDef): Type => {
  if (isPrimitive<Type>(typeDef)) {
    return typeDef;
  } else {
    const typeArray: Type[] = isArray<Type>(typeDef) ? typeDef : Object.values(typeDef);
    return createType(typeArray);
  }
};

