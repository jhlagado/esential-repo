import { TypeDef } from './types';
import { ExpressionRef, Type, createType, none } from 'binaryen';
import { isPrim } from './utils';

const expressionTypeDefs = new Map<ExpressionRef, TypeDef>();
const expressionTypes = new Map<ExpressionRef, Type>();
const typeDefMap = new Map<Type, TypeDef>();

export const setTypeDef = (expr: ExpressionRef, typeDef: TypeDef) => {
  expressionTypeDefs.set(expr, typeDef);
  const type = asType(typeDef);
  expressionTypes.set(expr, type);
  typeDefMap.set(type, typeDef);
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

export const getTypeDef2 = (type: Type, failThrow = true): TypeDef => {
  if (typeDefMap.has(type)) {
    return typeDefMap.get(type) as Type;
  }
  if (failThrow) {
    throw new Error(`Could not find typeDef for ${type}`);
  } else {
    return none;
  }
};

export const asType = (typeDef: TypeDef): Type => {
  if (isPrim<Type>(typeDef)) {
    typeDefMap.set(typeDef, typeDef);
    return typeDef;
  } else {
    const typeArray: Type[] = Array.isArray(typeDef) ? typeDef : Object.values(typeDef);
    const type = createType(typeArray);
    typeDefMap.set(type, typeDef);
    return type;
  }
};
