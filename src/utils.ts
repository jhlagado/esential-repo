import { Type, i32, ExpressionRef, i64, f32, f64 } from 'binaryen';
import { ops, tuple } from './core';
import { TypeDef, Expression } from './types';
import { stripTupleProxy } from './tuples';

export const asTypeArray = (typeDef: TypeDef) =>
  Number.isInteger(typeDef)
    ? [typeDef]
    : Array.isArray(typeDef)
    ? typeDef
    : Object.values(typeDef);

export const _ = (value: number, typeDef: Type = i32): ExpressionRef => {
  const opDict = {
    [i32]: ops.i32,
    [i64]: ops.i64,
    [f32]: ops.f32,
    [f64]: ops.f64,
  };
  if (typeDef in opDict) {
    // override type checking because of error in type definition for i64.const
    return (opDict[typeDef] as any).const(value);
  }
  throw new Error(`Can only use primtive types in val, not ${typeDef}`);
};

export const assignment = (expression: Expression, typeDef: TypeDef) => {
  const expr = stripTupleProxy(expression);
  if (Number.isInteger(expr)) {
    return expr;
  } else if (Array.isArray(expr)) {
    if (!Array.isArray(typeDef)) {
      throw new Error(`Tuple type expected`);
    }
    return tuple.make(expr);
  } else {
    if (typeof typeDef !== 'object') {
      throw new Error(`Record type expected`);
    }
    const array = Object.keys(typeDef).map(key => {
      if (!(key in expr)) {
        throw new Error(`Could not find ${key} in record`);
      }
      return expr[key];
    });
    return tuple.make(array);
  }
};
