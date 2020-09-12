import { Module } from 'binaryen';
import {
  Callable,
  LibFunc,
  Lib,
  Esential,
  Dict,
  MemDef,
  IndirectInfo,
  Ref,
  Imports,
} from './types';
import { CompileOptions } from './types';
import { FEATURE_MULTIVALUE } from './constants';
import { getFunc, getExternalFunc, getLiteral } from './lib-utils';
import { exportFuncs } from './funcs-utils';
import { getFOR, getIF } from './control';

export const esential = (): Esential => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  module.autoDrop();

  const importsRef: Ref<Imports> = { current: {} };
  const callableIdMap = new Map<Callable, string>();
  const callableIndirectMap = new Map<Callable, IndirectInfo>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
  const indirectTable: IndirectInfo[] = [];

  const compile = (options: CompileOptions = { optimize: true, validate: true }): any => {
    const ids = indirectTable.map(item => item.id);
    const { length } = ids;
    (module.setFunctionTable as any)(length, length, ids); // because .d.ts is wrong
    if (options.optimize) module.optimize();
    if (options.validate && !module.validate()) throw new Error('validation error');
    return new WebAssembly.Module(module.emitBinary());
  };

  const load = (binary: Uint8Array): any => {
    const instance = new WebAssembly.Instance(binary, importsRef.current);
    return instance.exports;
  };

  const esen: Esential = {
    module,

    lib(libFunc: LibFunc, args: Dict<any> = {}) {
      if (libMap.has(libFunc)) {
        return libMap.get(libFunc);
      }
      const lib = libFunc(esen, args);
      exportFuncs(module, lib, exportedSet, callableIdMap);
      libMap.set(libFunc, lib);
      return lib;
    },

    memory(def: MemDef): any {
      const { namespace = 'namespace', name = 'name', initial = 10, maximum = 100 } = def;
      const memObj = new WebAssembly.Memory({
        initial,
        maximum,
      });
      importsRef.current = {
        ...importsRef.current,
        [namespace]: {
          ...importsRef.current[namespace],
          [name]: memObj,
        },
      };
      module.addMemoryImport('0', namespace, name);
      module.setMemory(initial, maximum, name);
    },

    func: getFunc(module, callableIdMap, exportedSet),
    indirect: getFunc(module, callableIdMap, exportedSet, indirectTable),
    external: getExternalFunc(module, callableIdMap, importsRef),

    getIndirectInfo(callable: Callable) {
      return callableIndirectMap.get(callable);
    },

    literal: getLiteral(module),
    FOR: getFOR(module),
    IF: getIF(module),
    compile,
    load,
    start(options?: CompileOptions) {
      return load(compile(options));
    },
  };
  return esen;
};
