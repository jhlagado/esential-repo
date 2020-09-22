import { Expression, TypeDef } from './types';
import { ExpressionRef, Type, createType, none, Module } from 'binaryen';
import { asDict, isArray, isPrimitive } from './utils';
import { getLiteral } from './funcs-utils';

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

export const builtin = (module: Module, func: Function, resultTypeDef: TypeDef): Function => {
  return (...params: any[]) => {
    const params1 = params.map(param => {
      const paramTypeDef = getTypeDef(param, false);
      return paramTypeDef === none ? getLiteral(module, param) : param;
    });
    const expr = func(...params1);
    setTypeDef(expr, resultTypeDef);
    return expr;
  };
};
