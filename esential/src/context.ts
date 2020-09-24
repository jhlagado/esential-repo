/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Module, Type } from 'binaryen';
import {
  Callable,
  LibFunc,
  Lib,
  EsentialContext,
  Dict,
  IndirectInfo,
  MemoryDef,
  TableDef,
  EsentialCfg,
  TypeDef,
} from './types';
import { FEATURE_MULTIVALUE } from './constants';
import { getFunc, exportFuncs, getCompile, getGlobals, getLoad } from './context-utils';
import { getFOR, getIF } from './control';
import { getLiteral } from './literals';
import { getBuiltin } from './builtin';

export const esential = (cfg?: EsentialCfg): EsentialContext => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  module.autoDrop();

  let memoryDef: MemoryDef | null = null;
  let tableDef: TableDef | null = null;

  if (cfg && cfg.memory) {
    memoryDef = {
      initial: cfg.memory.initial || 10,
      maximum: cfg.memory.maximum,
      namespace: cfg.memory.namespace = 'env',
      name: cfg.memory.name = 'memory',
    };
  }

  if (cfg && cfg.table) {
    tableDef = {
      initial: cfg.table.initial || 10,
      maximum: cfg.table.maximum,
      namespace: cfg.table.namespace = 'env',
      name: cfg.table.name = 'table',
    };
  }

  const callableIdMap = new Map<Callable, string>();
  const callableIndirectMap = new Map<Callable, IndirectInfo>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
  const indirectTable: IndirectInfo[] = [];
  const globalVars: Dict<TypeDef> = {};

  const context: EsentialContext = {
    module,
    lib(libFunc: LibFunc, args: Dict<any> = {}) {
      if (libMap.has(libFunc)) {
        return libMap.get(libFunc);
      }
      const lib = libFunc(context, args);
      exportFuncs(module, lib, exportedSet, callableIdMap);
      libMap.set(libFunc, lib);
      return lib;
    },
    func: getFunc(module, callableIdMap, exportedSet, indirectTable, globalVars),
    globals: getGlobals(module, globalVars),
    getIndirectInfo: (callable: Callable) => callableIndirectMap.get(callable),
    getMemory: () => memoryDef,
    getTable: () => tableDef,
    builtin: getBuiltin(module),
    literal: (value: number, type?: Type) => getLiteral(module, value, type),
    FOR: getFOR(module),
    IF: getIF(module),
    compile: getCompile(module, memoryDef, tableDef, indirectTable),
    load: getLoad(memoryDef, tableDef),
  };
  return context;
};
