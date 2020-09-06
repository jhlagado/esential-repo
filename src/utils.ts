import {
  Type,
  i32,
  ExpressionRef,
  i64,
  f32,
  f64,
  createType,
} from 'binaryen';
import { ops } from './core';
import { TypeDef } from './types';

const expressionTypeDefs = new Map<ExpressionRef, TypeDef>();

export const asTypeArray = (typeDef: TypeDef) =>
  Number.isInteger(typeDef)
    ? [typeDef]
    : Array.isArray(typeDef)
    ? typeDef
    : Object.values(typeDef);

export const asType = (typeDef: TypeDef) => createType(asTypeArray(typeDef));

export const setTypeDef = (expr: ExpressionRef, typeDef: TypeDef) => {
  expressionTypeDefs.set(expr, typeDef);
};

export const getTypeDef = (expr: ExpressionRef): TypeDef => {
  if (expressionTypeDefs.has(expr)) {
    return expressionTypeDefs.get(expr) as Type;
  }
  throw new Error(`Could not find typeDef for ${expr}`);
};


export const builtin = (func: Function, resultTypeDef: TypeDef) => {
  return (...args: any[]) => {
    const expr = func(...args);
    setTypeDef(expr, resultTypeDef);
    return expr;
  };
};

export const literal = (value: number, type: Type = i32): ExpressionRef => {
  const opDict = {
    [i32]: ops.i32,
    [i64]: ops.i64,
    [f32]: ops.f32,
    [f64]: ops.f64,
  };
  if (type in opDict) {
    // override type checking because of error in type definition for i64.const
    const expr = (opDict[type] as any).const(value);
    setTypeDef(expr, type); // for primitives type = typeDef
    return expr;
  }
  throw new Error(`Can only use primtive types in val, not ${type}`);
};
