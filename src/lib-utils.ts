import { auto, ExpressionRef, none, createType, Module, Type, i32, i64, f32, f64 } from 'binaryen';
import {
  Callable,
  IndirectInfo,
  FuncDef,
  Initializer,
  Ref,
  TypeDef,
  Imports,
  ExternalDef,
} from './types';
import { getVarsProxy } from './vars';
import { getResultFunc, getBlockFunc, getExecFunc, getCallable } from './funcs-utils';
import { asType, setTypeDef } from './typedefs';

export const getFunc = (
  module: Module,
  callableIdMap: Map<Callable, string>,
  exportedSet: Set<Callable>,
  indirectTable?: IndirectInfo[],
) => (def: FuncDef, initializer: Initializer): Callable => {
  const count = callableIdMap.size;
  const {
    id = `indirect${count}`,
    params = {},
    result = auto,
    locals = {},
    export: exported = true,
  } = def;
  const bodyItems: ExpressionRef[] = [];
  const vars = { ...params, ...locals };
  const varsProxy = getVarsProxy(module, vars, bodyItems);
  const resultRef: Ref<TypeDef> = { current: result };
  const resultFunc = getResultFunc(module, resultRef, bodyItems);
  const blockFunc = getBlockFunc(module);
  const execFunc = getExecFunc(module, bodyItems);
  initializer({ $: varsProxy, result: resultFunc, block: blockFunc, exec: execFunc });
  const resultDef = resultRef.current === auto ? none : resultRef.current;
  const { length: paramsLength } = Object.values(params);
  const paramsType = createType(Object.values(params).map(asType));
  const resultType = asType(resultDef);
  const localTypes = Object.values(vars)
    .slice(paramsLength)
    .map(asType);
  module.addFunction(id, paramsType, resultType, localTypes, module.block(null as any, bodyItems));
  let exprFunc;
  if (indirectTable == null) {
    exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
  } else {
    const { length: index } = indirectTable;
    indirectTable.push({ index, id, paramDefs: params, resultDef: resultDef });
    exprFunc = (...params: ExpressionRef[]) =>
      module.call_indirect(module.i32.const(index), params, paramsType, resultType);
  }
  return getCallable(id, exported, exprFunc, resultDef, callableIdMap, exportedSet);
};

export const getExternalFunc = (
  module: Module,
  callableIdMap: Map<Callable, string>,
  importsRef: Ref<Imports>,
) => (def: ExternalDef, fn: Function): Callable => {
  const count = callableIdMap.size;
  const {
    namespace = 'namespace',
    name = 'name',
    id = `external${count}`,
    params: paramDefs = {},
    result: resultDef = none,
  } = def;
  const paramsType = createType(Object.values(paramDefs).map(asType));
  const resultType = asType(resultDef);
  module.addFunctionImport(id, namespace, name, paramsType, resultType);
  importsRef.current = {
    ...importsRef.current,
    [namespace]: {
      ...importsRef.current[namespace],
      [name]: fn,
    },
  };
  const exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
  return getCallable(id, false, exprFunc, resultDef, callableIdMap);
};

export const getLiteral = (module: Module) => (value: number, type: Type = i32): ExpressionRef => {
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
