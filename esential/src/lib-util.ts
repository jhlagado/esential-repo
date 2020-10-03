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

export const getFunc = (
  callableIdMap: Map<Callable, string>,
  exportedSet: Set<Callable>,
  indirectTable: IndirectInfo[],
  globalVars: Dict<TypeDef>,
) => (def: FuncDef, initializer?: Initializer): Callable => {
  const count = callableIdMap.size;
  const {
    id = `func${count}`,
    params = {},
    result,
    locals = {},
    export: exported = true,
    indirect = false,
  } = def;
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
  let exprFunc;
  if (!indirect) {
    exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
  } else {
    const index = indirectTable.length;
    indirectTable.push({ index, id, paramDefs: params, resultDef: resultDef });
    exprFunc = (...params: ExpressionRef[]) =>
      module.call_indirect(module.i32.const(index), params, paramsType, resultType);
  }
  return getCallable(id, exported, exprFunc, params, resultDef, callableIdMap, exportedSet);
};

export const getExternal = (callableIdMap: Map<Callable, string>) => (
  def: FuncDef,
): Callable => {
  const module = getModule();
  const count = callableIdMap.size;
  const { id = `func${count}`, params = {}, result, namespace = 'namespace', name = 'name' } = def;
  const resultDef = result == null ? none : result;
  const paramsType = createType(Object.values(params).map(asType));
  const resultType = asType(resultDef);
  module.addFunctionImport(id, namespace, name, paramsType, resultType);
  const exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
  return getCallable(id, false, exprFunc, params, resultDef, callableIdMap);
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
