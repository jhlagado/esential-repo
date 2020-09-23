import { ExpressionRef, auto, Module } from 'binaryen';
import { Expression, TypeDef, VoidBlockFunc, Ref, Callable, Dict, Accessor } from './types';
import { setTypeDef, getTypeDef } from './typedefs';
import { getAssignable, stripTupleProxy } from './tuples';
import { asArray } from './utils';
import { applyTypeDef } from './literals';

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
  const leadExprs = expressions
    .slice(0, -1)
    .map(expression => getAssignable(module, stripTupleProxy(expression)));
  bodyItems.push(...leadExprs);
  const expression = expressions[length - 1];
  const typeDef = resultDefRef.current === auto ? undefined : resultDefRef.current;
  const expr = applyTypeDef(module, stripTupleProxy(expression), typeDef);
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
    const params1 = params.map((param, index) =>
      applyTypeDef(module, stripTupleProxy(param), typeArray[index]),
    );
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
