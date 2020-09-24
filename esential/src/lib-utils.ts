import { auto, ExpressionRef, none, createType, Module } from 'binaryen';
import {
  Callable,
  IndirectInfo,
  FuncDef,
  Initializer,
  Ref,
  TypeDef,
  Dict,
  VarDefs,
  Expression,
  MemoryDef,
  TableDef,
  CompileOptions,
  Imports,
} from './types';
import { getVarsAccessor } from './accessors';
import { getResultFunc, getCallable } from './funcs-utils';
import { asType } from './typedefs';
import { applyTypeDef } from './literals';

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
    globals: locals = {},
    namespace = 'namespace',
    name = 'name',
    export: exported = true,
    indirect = false,
    external = false,
  } = def;
  if (external) {
    const resultDef = result == null ? none : result;
    const paramsType = createType(Object.values(params).map(asType));
    const resultType = asType(resultDef);
    module.addFunctionImport(id, namespace, name, paramsType, resultType);
    const exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
    return getCallable(module, id, false, exprFunc, params, resultDef, callableIdMap);
  } else {
    const bodyItems: ExpressionRef[] = [];
    const vars = { ...params, ...locals };
    const varsAccessor = getVarsAccessor(module, vars, globalVars);
    const resultRef: Ref<TypeDef> = { current: result == null ? auto : result };
    const resultFunc = getResultFunc(module, resultRef, bodyItems);
    if (initializer) initializer({ vars: varsAccessor, result: resultFunc });
    const resultDef = resultRef.current === auto ? none : resultRef.current;
    const { length: paramsLength } = Object.values(params);
    const paramsType = createType(Object.values(params).map(asType));
    const resultType = asType(resultDef);
    const localTypes = Object.values(vars)
      .slice(paramsLength)
      .map(asType);
    module.addFunction(
      id,
      paramsType,
      resultType,
      localTypes,
      module.block(null as any, bodyItems),
    );
    let exprFunc;
    if (!indirect) {
      exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
    } else {
      const { length: index } = indirectTable;
      indirectTable.push({ index, id, paramDefs: params, resultDef: resultDef });
      exprFunc = (...params: ExpressionRef[]) =>
        module.call_indirect(module.i32.const(index), params, paramsType, resultType);
    }
    return getCallable(
      module,
      id,
      exported,
      exprFunc,
      params,
      resultDef,
      callableIdMap,
      exportedSet,
    );
  }
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

export const getGlobals = (module: Module, globalVarDefs: VarDefs) => (
  varDefs: VarDefs,
  assignments: Dict<Expression>,
) => {
  Object.entries(assignments).forEach(([prop, expression]) => {
    let typeDef = varDefs[prop];
    const expr = applyTypeDef(module, (expression), typeDef);
    globalVarDefs[prop] = typeDef;
    return module.addGlobal(prop, asType(typeDef), true, expr);
  });
};

export const getCompile = (
  module: Module,
  memoryDef: MemoryDef | null,
  tableDef: TableDef | null,
  indirectTable: IndirectInfo[],
) => ({
  optimize = true,
  validate = true,
  debugRaw = true,
  debugOptimized: debugOpt = false,
}: CompileOptions = {}): any => {
  if (memoryDef) {
    module.addMemoryImport('0', memoryDef.namespace!, memoryDef.name!);
    module.setMemory(memoryDef.initial!, memoryDef.maximum!, memoryDef.name!);
  }
  const ids = indirectTable.map(item => item.id);
  const { length } = ids;
  if (length > 0 && tableDef) {
    module.addTableImport('0', tableDef.namespace!, tableDef.name!);
    if (length > tableDef.initial!) {
      throw new Error(`Table initial size too small, needs at least ${length}`);
    }
    if (length > tableDef.maximum!) {
      throw new Error(`Table maximum size too small, needs at least ${length}`);
    }
    // because .d.ts is wrong
    (module.setFunctionTable as any)(tableDef.initial, tableDef.maximum, ids);
  }
  if (debugRaw) {
    console.log('Raw: ', module.emitText());
  }
  if (optimize) module.optimize();
  if (debugOpt) {
    console.log('Optimised: ', module.emitText());
  }
  if (validate && !module.validate()) throw new Error('validation error');
  return module.emitBinary();
};

export const getLoad = (memoryDef: MemoryDef | null, tableDef: TableDef | null) => (
  binary: Uint8Array,
  imports: Imports = { env: {} },
): any => {
  const imports1 = {
    ...imports,
  };
  if (memoryDef) {
    const { instance, namespace, name, initial, maximum } = memoryDef;
    memoryDef.instance =
      instance != null
        ? instance
        : new WebAssembly.Memory({
            initial: initial!,
            maximum: maximum,
          });
    const ns = imports1[namespace as string] || {};
    ns[name as string] = memoryDef.instance;
  }
  if (tableDef) {
    const { instance, namespace, name, initial, maximum } = tableDef;
    tableDef.instance =
      instance != null
        ? instance
        : new WebAssembly.Table({
            initial: initial!,
            maximum: maximum,
            element: 'anyfunc',
          });
    const ns = imports1[namespace as string] || {};
    ns[name as string] = tableDef.instance;
  }
  const wasmModule = new WebAssembly.Module(binary);
  const instance = new WebAssembly.Instance(wasmModule, imports1);
  return instance.exports;
};
