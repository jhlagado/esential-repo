import { Expression, TypeDef } from './types';
import { ExpressionRef, Type, createType } from 'binaryen';
import { asDict } from './utils';

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

