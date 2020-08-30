import { Type, i32, ExpressionRef } from "binaryen";
import { prims } from "./core";

export const asArray = (arg: any) => (Array.isArray(arg) ? arg : [arg]);

export const val = (value: number, typeDef: Type = i32): ExpressionRef => {
  if (typeDef in prims) {
    // override type checking because of error in type definition for i64.const
    return (prims[typeDef] as any).const(value);
  }
  throw `Can only use primtive types in val, not ${typeDef}`;
};
