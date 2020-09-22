import { Dict, Expression, TypeDef } from './types';
import { ExpressionRef, Type, createType, none, Module, i32, f32, f64, i64 } from 'binaryen';
import { asArray, asDict, isArray, isPrimitive } from './utils';

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

export const getLiteral = (module: Module, value: number, type: Type = i32): ExpressionRef => {
  const opDict = {
    [i32]: module.i32,
    [i64]: module.i64,
    [f32]: module.f32,
    [f64]: module.f64,
  };
  if (type in opDict) {
    // .d.ts error in type definition for i64.const
    const expr = (opDict[type] as any).const(value);
    setTypeDef(expr, type); // for primitives type === typeDef
    return expr;
  }
  throw new Error(`Can only use primitive types in val, not ${type}`);
};

export const applyTypeDefPrimitive = (
  module: Module,
  expr: ExpressionRef,
  typeDef?: TypeDef,
): ExpressionRef => {
  if (typeDef === none) {
    return expr;
  }
  const exprTypeDef = getTypeDef(expr, false);
  if (exprTypeDef === none) {
    return getLiteral(module, expr, asType(typeDef || i32));
  } else {
    if (typeDef != null && asType(typeDef) !== asType(exprTypeDef)) {
      throw new Error(`Type mismatch: expected ${typeDef} but got ${exprTypeDef}`);
    }
    return expr;
  }
};

export const applyTypeDef = (
  module: Module,
  expression: Expression,
  typeDef?: TypeDef,
): ExpressionRef => {
  if (isPrimitive<ExpressionRef>(expression)) {
    return applyTypeDefPrimitive(module, expression, typeDef);
  } else {
    const typeArray = typeDef ? asArray<Type>(typeDef as any) : [];
    const exprArray = asArray<ExpressionRef>(expression).map((expr, index) => {
      const expr1 = applyTypeDefPrimitive(module, expr, typeArray[index]);
      if (typeArray[index] == null) {
        typeArray[index] = getTypeDef(expr1) as number;
      }
      return expr1;
    });
    const tupleExpr = module.tuple.make(exprArray);
    let typeDef1: TypeDef = isArray(expression)
      ? typeArray
      : Object.keys(expression)
          .sort()
          .reduce((acc, key, index) => {
            (acc as Dict<Type>)[key] = typeArray[index];
            return acc;
          }, {} as TypeDef);
    setTypeDef(tupleExpr, typeDef1);
    return tupleExpr;
  }
};

export const builtin = (
  module: Module,
  func: Function,
  paramTypeDefs: Dict<TypeDef> | TypeDef[],
  resultTypeDef: TypeDef,
): Function => {
  return (...params: any[]) => {
    const typeArray = asArray(paramTypeDefs);
    const params1 = params.map((param, index) => applyTypeDef(module, param, typeArray[index]));
    const expr = func(...params1);
    setTypeDef(expr, resultTypeDef);
    return expr;
  };
};
