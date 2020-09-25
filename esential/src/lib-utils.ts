import { auto, ExpressionRef, none, createType, Module } from 'binaryen';
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
import { getResultFunc, getCallable, asExpressionRef } from './func-utils';
import { asType } from './typedefs';
import { literalize } from './literals';

export const getFunc = (
  module: Module,
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
  const bodyItems: ExpressionRef[] = [];
  const vars = { ...params, ...locals };
  const varsAccessor = getVarsAccessor(module, vars, globalVars);
  const resultRef: Ref<TypeDef> = { current: result == null ? auto : result };
  const resultFunc = getResultFunc(module, resultRef, bodyItems);
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
    const { length: index } = indirectTable;
    indirectTable.push({ index, id, paramDefs: params, resultDef: resultDef });
    exprFunc = (...params: ExpressionRef[]) =>
      module.call_indirect(module.i32.const(index), params, paramsType, resultType);
  }
  return getCallable(module, id, exported, exprFunc, params, resultDef, callableIdMap, exportedSet);
};

export const getExternal = (module: Module, callableIdMap: Map<Callable, string>) => (
  def: FuncDef,
): Callable => {
  const count = callableIdMap.size;
  const { id = `func${count}`, params = {}, result, namespace = 'namespace', name = 'name' } = def;
  const resultDef = result == null ? none : result;
  const paramsType = createType(Object.values(params).map(asType));
  const resultType = asType(resultDef);
  module.addFunctionImport(id, namespace, name, paramsType, resultType);
  const exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
  return getCallable(module, id, false, exprFunc, params, resultDef, callableIdMap);
};

export const getGlobals = (module: Module, globalVarDefs: Dict<TypeDef>) => (
  varDefs: Dict<TypeDef>,
  assignments: Dict<Expression>,
) => {
  Object.entries(assignments).forEach(([prop, expression]) => {
    let typeDef = varDefs[prop];
    const expr = literalize(module, expression, typeDef);
    globalVarDefs[prop] = typeDef;
    return module.addGlobal(prop, asType(typeDef), true, expr);
  });
};

export const getBlock = (module: Module) => (...args: Expression[]) =>
  module.block(
    null as any,
    args.map(arg => asExpressionRef(module, arg)),
    auto,
  );
