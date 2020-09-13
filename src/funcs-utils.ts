import { Expression, TypeDef, VoidBlockFunc, Ref, Callable, Dict } from './types';

import { ExpressionRef, auto, Module } from 'binaryen';
import { inferTypeDef, setTypeDef, getTypeDef, asType } from './typedefs';
import { getAssignable, stripTupleProxy } from './vars';

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
  id: string,
  exported: boolean,
  exprFunc: (...params: ExpressionRef[]) => ExpressionRef,
  resultDef: TypeDef,
  callableIdMap: Map<Callable, string>,
  exportedSet?: Set<Callable>,
) => {
  const callable = (...params: ExpressionRef[]) => {
    const expr = exprFunc(...params);
    setTypeDef(expr, resultDef);
    return expr;
  };
  callableIdMap.set(callable, id);
  if (exported && exportedSet) {
    exportedSet.add(callable);
  }
  return callable;
};

export const exportFuncs = (
  module: Module,
  lib: Dict<any>,
  exportedSet: Set<Callable>,
  callableIdMap: Map<Callable, string>,
) => {
  Object.entries(lib).forEach(([externalName, callable]) => {
    if (exportedSet.has(callable)) {
      const internalName = callableIdMap.get(callable);
      if (internalName) {
        module.addFunctionExport(internalName, externalName);
        exportedSet.delete(callable);
      }
    }
  });
};

