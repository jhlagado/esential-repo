import { Expression, TypeDef } from "./types";
import { ExpressionRef, Type, createType, i32, i64, f32, f64 } from "binaryen";
import { asDict } from "./utils";
import { ops } from "./core";

const expressionTypeDefs = new Map<ExpressionRef, TypeDef>();

export const setTypeDef = (expr: ExpressionRef, typeDef: TypeDef) => {
  expressionTypeDefs.set(expr, typeDef);
};

export const getTypeDef = (expr: ExpressionRef): TypeDef => {
  if (expressionTypeDefs.has(expr)) {
    return expressionTypeDefs.get(expr) as Type;
  }
  throw new Error(`Could not find typeDef for ${expr}`);
};

export const asType = (typeDef: TypeDef): Type => {
  if (Number.isInteger(typeDef)) {
    return typeDef as Type;
  } else {
    const typeArray: Type[] = Array.isArray(typeDef) ? typeDef : Object.values(typeDef);
    return createType(typeArray);
  }
};

export const builtin = (func: Function, resultTypeDef: TypeDef): Function => {
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

export const inferTypeDef = (expression: Expression): TypeDef => {
  if (Number.isInteger(expression)) {
    return getTypeDef(expression as ExpressionRef);
  } else {
    if (Array.isArray(expression)) {
      return expression.map(item => asType(getTypeDef(item)));
    } else {
      const typeDef = asDict(
        Object.entries(expression)
          .sort(([key1], [key2]) => (key1 === key2 ? 0 : key1 < key2 ? -1 : 1))
          .map(([key, value]) => [key, asType(getTypeDef(value))]),
      );
      return typeDef;
    }
  }
};
