/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Module } from 'binaryen';
import {
  Callable,
  LibFunc,
  Lib,
  Esential,
  Dict,
  IndirectInfo,
  Imports,
  MemoryDef,
  TableDef,
} from './types';
import { CompileOptions } from './types';
import { FEATURE_MULTIVALUE } from './constants';
import { getFunc, getLiteral, exportFuncs } from './lib-utils';
import { getFOR, getIF } from './control';

export type EsentialCfg = {
  memory?: MemoryDef;
  table?: TableDef;
};

export const esential = (cfg?: EsentialCfg): Esential => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  module.autoDrop();

  let memoryDef: MemoryDef;
  let tableDef: TableDef;

  if (cfg && cfg.memory) {
    memoryDef = {
      initial: cfg.memory.initial = 10,
      maximum: cfg.memory.maximum = 100,
      namespace: cfg.memory.namespace = 'env',
      name: cfg.memory.name = 'memory',
      instance: new WebAssembly.Memory({
        initial: cfg.memory.initial = 10,
        maximum: cfg.memory.maximum = 100,
      }),
    };
  }

  if (cfg && cfg.table) {
    tableDef = {
      initial: cfg.table.initial = 10,
      maximum: cfg.table.maximum = 100,
      namespace: cfg.table.namespace = 'env',
      name: cfg.table.name = 'table',
      instance: new WebAssembly.Table({
        initial: cfg.table.initial = 10,
        maximum: cfg.table.maximum = 100,
        element: 'anyfunc',
      }),
    };
  }

  const callableIdMap = new Map<Callable, string>();
  const callableIndirectMap = new Map<Callable, IndirectInfo>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
  const indirectTable: IndirectInfo[] = [];

  const compile = ({ optimize = true, validate = true }: CompileOptions = {}): any => {
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
      (module.setFunctionTable as any)(tableDef.initial, tableDef.maximum, ids); // because .d.ts is wrong
    }
    if (optimize) module.optimize();
    if (validate && !module.validate()) throw new Error('validation error');
    return module.emitBinary();
  };

  const load = (binary: Uint8Array, imports: Imports = { env: {} }): any => {
    const imports1 = {
      ...imports,
    };
    if (memoryDef) {
      const namespace = imports1[memoryDef.namespace as string] || {};
      namespace[memoryDef.name as string] = memoryDef.instance;
    }
    if (tableDef) {
      const namespace = imports1[tableDef.namespace as string] || {};
      namespace[tableDef.name as string] = tableDef.instance;
    }
    const wasmModule = new WebAssembly.Module(binary);
    const instance = new WebAssembly.Instance(wasmModule, imports1);
    return instance.exports;
  };

  const self: Esential = {
    module,

    lib(libFunc: LibFunc, args: Dict<any> = {}) {
      if (libMap.has(libFunc)) {
        return libMap.get(libFunc);
      }
      const lib = libFunc(self, args);
      exportFuncs(module, lib, exportedSet, callableIdMap);
      libMap.set(libFunc, lib);
      return lib;
    },

    func: getFunc(module, callableIdMap, exportedSet, indirectTable),

    getIndirectInfo(callable: Callable) {
      return callableIndirectMap.get(callable);
    },

    getMemory: () => memoryDef,
    getTable: () => tableDef,
    literal: getLiteral(module),
    FOR: getFOR(module),
    IF: getIF(module),
    compile,
    load,
  };
  return self;
};
