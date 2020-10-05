import { ExpressionRef, auto, getExpressionType } from 'binaryen';
import { TypeDef, VoidBlockFunc, Ref, Callable, Dict, Expression } from './types';
import { setTypeDef, getTypeDef } from './type-util';
import { asArray } from './util';
import { literalize } from './literals';
import { resolveExpression } from './util';
import { getModule } from './module';
import { callableIdMap } from './maps';

export const getResultFunc = (
  resultRef: Ref<TypeDef>,
  bodyItems: ExpressionRef[],
): VoidBlockFunc => (...expressions) => {
  const module = getModule();
  const { length } = expressions;
  if (length < 1) throw new Error(`Result function must have at least one arg`);

  const leadExprs = expressions.slice(0, -1).map(resolveExpression);
  bodyItems.push(...leadExprs);
  const expression = expressions[length - 1];
  const typeDef = resultRef.current === auto ? undefined : resultRef.current;
  const expr = literalize(expression, typeDef);
  if (typeDef == null) resultRef.current = getTypeDef(getExpressionType(expr));
  
  bodyItems.push(module.return(expr));
};

export const getCallable = (
  id: string,
  exported: boolean,
  exprFunc: (...params: ExpressionRef[]) => ExpressionRef,
  typeDef: Dict<TypeDef> | TypeDef[],
  resultDef: TypeDef,
  exportedSet?: Set<Callable>,
) => {
  const callable = (...params: Expression[]) => {
    const typeArray = asArray(typeDef);
    const params1 = params.map((param, index) => literalize(param, typeArray[index]));
    const expr = exprFunc(...params1);
    setTypeDef(expr, resultDef);
    return expr;
  };
  callableIdMap.set(callable, id);
  if (exported && exportedSet) exportedSet.add(callable);

  return callable;
};

export const exportFuncs = (
  lib: Dict<any>,
  exportedSet: Set<Callable>,
) => {
  const module = getModule();
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

