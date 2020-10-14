import { auto, ExpressionRef, none, createType } from 'binaryen';
import {
  Callable,
  IndirectInfo,
  FuncDef,
  Initializer,
  Ref,
  TypeDef,
  Dict,
  Expression,
} from './types';
import { getVarsAccessor } from './accessors';
import { getResultFunc, getCallable } from './func-util';
import { asType } from './type-util';
import { literalize } from './literals';
import { getModule } from './module';
import { callableIdMap, callableInfoMap } from './maps';

export const getDirectFuncImpl = () => (
  id: string,
  _paramDefs: Dict<TypeDef>,
  resultDef: TypeDef,
) => {
  const resultType = asType(resultDef);
  const exprFunc = (...params: ExpressionRef[]) => getModule().call(id, params, resultType);
  return { exprFunc };
};

export const getIndirectFuncImpl = (indirectTable: IndirectInfo[]) => (
  id: string,
  paramDefs: Dict<TypeDef>,
  resultDef: TypeDef,
) => {
  const module = getModule();
  const paramsType = createType(Object.values(paramDefs).map(asType));
  const resultType = asType(resultDef);
  const index = indirectTable.length;
  const info = { index, id, paramDefs, resultDef };
  indirectTable.push(info);
  const exprFunc = (...params: ExpressionRef[]) =>
    module.call_indirect(module.i32.const(index), params, paramsType, resultType);
  return { exprFunc, info };
};

export const getFunc = (
  exportedSet: Set<Callable>,
  globalVars: Dict<TypeDef>,
  getFuncImpl: (
    id: string,
    paramDefs: Dict<TypeDef>,
    resultDef: TypeDef,
  ) => { exprFunc: (...params: ExpressionRef[]) => ExpressionRef; info?: Dict<any> },
) => (def: FuncDef, initializer?: Initializer): Callable => {
  const count = callableIdMap.size;
  const { id = `func${count}`, params = {}, result, locals = {}, export: exported = true } = def;
  const module = getModule();
  const bodyItems: ExpressionRef[] = [];
  const vars = { ...params, ...locals };
  const varsAccessor = getVarsAccessor(vars, globalVars);
  const resultRef: Ref<TypeDef> = { current: result == null ? auto : result };
  const resultFunc = getResultFunc(resultRef, bodyItems);
  if (initializer) initializer(resultFunc, varsAccessor);
  const resultDef = resultRef.current === auto ? none : resultRef.current;
  const { length: paramsLength } = Object.values(params);
  const paramsType = createType(Object.values(params).map(asType));
  const resultType = asType(resultDef);
  const localTypes = Object.values(vars)
  .slice(paramsLength)
  .map(asType);
  module.addFunction(id, paramsType, resultType, localTypes, module.block(null as any, bodyItems));
  const { exprFunc, info } = getFuncImpl(id, params, resultType);
  const callable = getCallable(id, exported, exprFunc, params, resultDef, exportedSet);
  if (info != null) callableInfoMap.set(callable, info);

  return callable;
};

export const getExternal = () => (def: FuncDef): Callable => {
  const module = getModule();
  const count = callableIdMap.size;
  const { id = `func${count}`, params = {}, result, namespace = 'namespace', name = 'name' } = def;
  const resultDef = result == null ? none : result;
  const paramsType = createType(Object.values(params).map(asType));
  const resultType = asType(resultDef);
  module.addFunctionImport(id, namespace, name, paramsType, resultType);
  const exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
  return getCallable(id, false, exprFunc, params, resultDef);
};

export const getGlobals = (globalVarDefs: Dict<TypeDef>) => (
  varDefs: Dict<TypeDef>,
  assignments: Dict<Expression>,
) => {
  const module = getModule();
  Object.entries(assignments).forEach(([prop, expression]) => {
    let typeDef = varDefs[prop];
    const expr = literalize(expression, typeDef);
    globalVarDefs[prop] = typeDef;
    return module.addGlobal(prop, asType(typeDef), true, expr);
  });
};
