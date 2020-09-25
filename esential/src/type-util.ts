import { TypeDef } from './types';
import { ExpressionRef, Type, createType, none } from 'binaryen';
import { isPrim } from './util';

const typeDefMap = new Map<Type, TypeDef>();

export const setTypeDef = (expr: ExpressionRef, typeDef: TypeDef) => {
  typeDefMap.set(asType(typeDef), typeDef);
};

export const getTypeDef = (type: Type, failThrow = true): TypeDef => {
  if (type === none) return none;
  if (typeDefMap.has(type)) return typeDefMap.get(type) as Type;
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
