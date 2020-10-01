import { ExpressionRef, Type, createType, none, auto } from 'binaryen';
import { TypeDef } from './types';
import { isPrim } from './util';

const typeDefMap = new Map<Type, TypeDef>();
const exprTypeMap = new Map<ExpressionRef, Type>();

export const setTypeDef = (expr: ExpressionRef, typeDef: TypeDef) => {
  const type = asType(typeDef);
  exprTypeMap.set(expr, type);
  typeDefMap.set(type, typeDef);
};

export const getExprType = (expr: ExpressionRef): Type | undefined => {
  return exprTypeMap.get(expr);
};

export const getTypeDefOrNull = (type: Type): TypeDef | undefined => {
  if (type === none) return none;
  return typeDefMap.get(type);
};

export const getTypeDef = (type: Type): TypeDef => {
  if (type === none) return none;
  if (typeDefMap.has(type)) return typeDefMap.get(type) as Type;
  throw new Error(`Could not find typeDef for ${type}`);
};

export const asType = (typeDef?: TypeDef): Type => {
  if (typeDef == null) return auto;
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
