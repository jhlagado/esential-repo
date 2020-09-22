import { Expression, TypeDef } from './types';
import { ExpressionRef, Type, createType, none, Module, i32, f32, f64, i64 } from 'binaryen';
import { asDict, isArray, isPrimitive } from './utils';

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

export const inferTypeDef = (expression: Expression): TypeDef => {
  if (isPrimitive<ExpressionRef>(expression)) {
    return getTypeDef(expression);
  } else {
    if (isArray<ExpressionRef>(expression)) {
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

export const builtin = (module: Module, func: Function, paramTypeDefs: TypeDef[], resultTypeDef: TypeDef): Function => {
  return (...params: any[]) => {
    const params1 = params.map((param, index) => {
      const paramTypeDef = index < paramTypeDefs.length ? paramTypeDefs[index] : i32;
      if (paramTypeDef === none) {
        return param;
      }
      const typeDef = getTypeDef(param, false);
      return typeDef === none ? getLiteral(module, param, asType(paramTypeDef)) : param;
    });
    const expr = func(...params1);
    setTypeDef(expr, resultTypeDef);
    return expr;
  };
};

export const getLiteral = (module: Module, value: number, type: Type = i32): ExpressionRef => {
  const opDict = {
    [i32]: module.i32,
    [i64]: module.i64,
    [f32]: module.f32,
    [f64]: module.f64,
  };
  if (type in opDict) {
    // override type checking because of error in type definition for i64.const
    const expr = (opDict[type] as any).const(value);
    setTypeDef(expr, type); // for primitives type = typeDef
    return expr;
  }
  throw new Error(`Can only use primitive types in val, not ${type}`);
};
