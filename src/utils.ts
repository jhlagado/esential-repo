import { Type, i32, ExpressionRef } from 'binaryen';
import { prims, tuple } from './core';
import { TypeDef, Expression } from './types';
import { stripTupleProxy } from './tuples';

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

export const assignment = (expression: Expression, typeDef: TypeDef) => {
  const expr = stripTupleProxy(expression);
  if (Number.isInteger(expr)) {
    return expr;
  } else if (Array.isArray(expr)) {
    if (!Array.isArray(typeDef)) {
      throw `Tuple type expected`;
    }
    return tuple.make(expr);
  } else {
    if (typeof typeDef !== 'object') {
      throw `Record type expected`;
    }
    const array = Object.keys(typeDef).map(key => {
      if (!(key in expr)) {
        throw `Could not find ${key} in record`;
      }
      return expr[key];
    });
    return tuple.make(array);
  }
};
