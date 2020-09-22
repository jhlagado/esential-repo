import { Expression, TypeDef, VoidBlockFunc, Ref, Callable } from './types';

import { ExpressionRef, auto, Module, none, i32, i64, f32, f64, Type } from 'binaryen';
import { inferTypeDef, setTypeDef, getTypeDef, asType } from './typedefs';
import { getAssignable, stripTupleProxy } from './tuples';

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
  throw new Error(`Can only use primtive types in val, not ${type}`);
};

export const getResultFunc = (
  module: Module,
  resultDefRef: Ref<TypeDef>,
  bodyItems: ExpressionRef[],
): VoidBlockFunc => (...expressions: Expression[]) => {
  const exprs = expressions.map(getAssignable(module));
  const { length } = exprs;
  if (length === 0) {
    throw new Error(`Result function must have at least one arg`);
  }
  bodyItems.push(...exprs.slice(0, -1));
  const [expr] = exprs.slice(-1);
  if (resultDefRef.current === auto) {
    const typeDef = inferTypeDef(stripTupleProxy(expr));
    if (typeDef == null) {
      throw new Error(`Couldn't infer ${expr}`);
    }
    setTypeDef(expr, typeDef);
    resultDefRef.current = typeDef;
  } else {
    const exprTypeDef = getTypeDef(expr);
    if (asType(exprTypeDef) != asType(resultDefRef.current)) {
      throw new Error(`Wrong return type, expected ${resultDefRef} and got ${exprTypeDef}`);
    }
  }
  bodyItems.push(module.return(expr));
};

export const getCallable = (
  module: Module,
  id: string,
  exported: boolean,
  exprFunc: (...params: ExpressionRef[]) => ExpressionRef,
  resultDef: TypeDef,
  callableIdMap: Map<Callable, string>,
  exportedSet?: Set<Callable>,
) => {
  const callable = (...params: ExpressionRef[]) => {
    const params1 = params.map(param => {
      const paramTypeDef = getTypeDef(param, false);
      return paramTypeDef === none ? getLiteral(module, param, i32) : param;
    });
    const expr = exprFunc(...params1);
    setTypeDef(expr, resultDef);
    return expr;
  };
  callableIdMap.set(callable, id);
  if (exported && exportedSet) {
    exportedSet.add(callable);
  }
  return callable;
};
