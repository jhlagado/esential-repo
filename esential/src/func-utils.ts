import { ExpressionRef, auto, Module } from 'binaryen';
import { TypeDef, VoidBlockFunc, Ref, Callable, Dict, Accessor, Expression } from './types';
import { setTypeDef, getTypeDef } from './typedefs';
import { asArray, isPrim } from './utils';
import { applyTypeDef } from './literals';
import { resolveExpression } from './utils';

export const asExpressionRef = (module: Module, expression: Expression): ExpressionRef => {
  const resolved = resolveExpression(expression);
  if (isPrim<ExpressionRef>(resolved)) {
    return resolved;
  } else {
    const exprArray = Array.isArray(resolved)
      ? resolved
      : Object.keys(resolved)
          .sort()
          .map(key => resolved[key]);
    return module.tuple.make(exprArray);
  }
};

export const getResultFunc = (
  module: Module,
  resultDefRef: Ref<TypeDef>,
  bodyItems: ExpressionRef[],
): VoidBlockFunc => (...expressions) => {
  const { length } = expressions;
  if (length < 1) {
    throw new Error(`Result function must have at least one arg`);
  }
  // const leadExprs = expressions.slice(0, -1).map(getAssignable(module));
  const leadExprs = expressions.slice(0, -1).map(expression => asExpressionRef(module, expression));
  bodyItems.push(...leadExprs);
  const expression = expressions[length - 1];
  const typeDef = resultDefRef.current === auto ? undefined : resultDefRef.current;
  const expr = applyTypeDef(module, expression, typeDef);
  if (typeDef == null) {
    resultDefRef.current = getTypeDef(expr);
  }
  bodyItems.push(module.return(expr));
};

export const getCallable = (
  module: Module,
  id: string,
  exported: boolean,
  exprFunc: (...params: ExpressionRef[]) => ExpressionRef,
  typeDef: Dict<TypeDef> | TypeDef[],
  resultDef: TypeDef,
  callableIdMap: Map<Callable, string>,
  exportedSet?: Set<Callable>,
) => {
  const callable = (...params: (ExpressionRef | Accessor)[]) => {
    const typeArray = asArray(typeDef);
    const params1 = params.map((param, index) => applyTypeDef(module, param, typeArray[index]));
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
