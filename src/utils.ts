import { Type, i32, ExpressionRef } from 'binaryen';
import { prims } from './core';
import { TypeDef } from './types';

export const asArray = (arg: any) => (Array.isArray(arg) ? arg : [arg]);

export const asTypeArray = (typeDef: TypeDef) =>
  Number.isInteger(typeDef)
    ? [typeDef]
    : Array.isArray(typeDef)
    ? typeDef
    : Object.values(typeDef);

export const val = (value: number, typeDef: Type = i32): ExpressionRef => {
  if (typeDef in prims) {
    // override type checking because of error in type definition for i64.const
    return (prims[typeDef] as any).const(value);
  }
  throw `Can only use primtive types in val, not ${typeDef}`;
};
