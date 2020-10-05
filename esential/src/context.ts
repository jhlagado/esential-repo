import {
  Callable,
  LibFunc,
  EsentialContext,
  Dict,
  IndirectInfo,
  MemoryDef,
  TableDef,
  EsentialCfg,
  TypeDef,
} from './types';
import { FEATURE_MULTIVALUE } from './constants';
import { getCompile, getLoad } from './context-utils';
import { exportFuncs } from './func-util';
import {
  getFunc,
  getExternal,
  getGlobals,
  getDirectFuncImpl,
  getIndirectFuncImpl,
} from './lib-util';
import { getModule } from './module';
import { callableInfoMap } from './maps';

export const esential = (cfg?: EsentialCfg): EsentialContext => {
  const module = getModule();

  module.setFeatures(FEATURE_MULTIVALUE);
  module.autoDrop();

  let memoryDef: MemoryDef | null = null;
  let tableDef: TableDef | null = null;

  if (cfg && cfg.memory) {
    memoryDef = {
      initial: cfg.memory.initial || 10,
      maximum: cfg.memory.maximum,
      namespace: cfg.memory.namespace || 'env',
      name: cfg.memory.name || 'memory',
      segments: cfg.memory.segments || [],
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

  const libMap = new Map<LibFunc, Dict<Callable>>();
  const exportedSet = new Set<Callable>();
  const indirectTable: IndirectInfo[] = [];
  const globalVars: Dict<TypeDef> = {};

  const context: EsentialContext = {
    lib(libFunc: LibFunc, args: Dict<any> = {}) {
      if (libMap.has(libFunc)) {
        return libMap.get(libFunc);
      }
      const lib = libFunc(context, args);
      exportFuncs(lib, exportedSet);
      libMap.set(libFunc, lib);
      return lib;
    },
    func: getFunc(exportedSet, globalVars, getDirectFuncImpl()),
    indirect: getFunc(exportedSet, globalVars, getIndirectFuncImpl(indirectTable)),
    external: getExternal(),
    globals: getGlobals(globalVars),

    compile: getCompile(memoryDef, tableDef, indirectTable),
    load: getLoad(memoryDef, tableDef),
  };
  return context;
};
