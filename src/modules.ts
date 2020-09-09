import { Module } from 'binaryen';
import {
  Callable,
  LibFunc,
  Lib,
  ModDef,
  Dict,
  MemDef,
  IndirectInfo,
  updateFunc,
} from './types';
import { CompileOptions } from './types';
import { externalFunc, funcFunc, indirectFunc } from './callables';

const FEATURE_MULTIVALUE = 512; // hardwired because of error in enum in binaryen.js .d.ts

export const Mod = (): ModDef => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  module.autoDrop();

  let imports: Dict<Dict<any>> = {};
  const callableIdMap = new Map<Callable, string>();
  const callableIndirectMap = new Map<Callable, IndirectInfo>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
  const indirectTable: IndirectInfo[] = [];

  const updateImports = (fn: updateFunc<any>) => {
    imports = fn(imports);
  };

  const { emitText } = module;
  const self: ModDef = {
    lib(libFunc: LibFunc, args: Dict<any> = {}) {
      if (libMap.has(libFunc)) {
        return libMap.get(libFunc);
      }
      const lib = libFunc(self, args);
      Object.entries(lib).forEach(([externalName, callable]) => {
        if (exportedSet.has(callable)) {
          const internalName = callableIdMap.get(callable);
          if (internalName) {
            module.addFunctionExport(internalName, externalName);
            exportedSet.delete(callable);
          }
        }
      });
      libMap.set(libFunc, lib);
      return lib;
    },

    memory(def: MemDef): any {
      const { namespace = 'namespace', name = 'name', initial = 10, maximum = 100 } = def;
      const memObj = new WebAssembly.Memory({
        initial,
        maximum,
      });
      imports = {
        ...imports,
        [namespace]: {
          ...imports[namespace],
          [name]: memObj,
        },
      };
      module.addMemoryImport('0', namespace, name);
      module.setMemory(initial, maximum, name);
    },

    external: externalFunc(module, callableIdMap, updateImports),

    func: funcFunc(module, callableIdMap, exportedSet),

    indirect: indirectFunc(module, callableIdMap, indirectTable, exportedSet),

    compile(options: CompileOptions = { optimize: true, validate: true }): any {
      const ids = indirectTable.map(item => item.id);
      const { length } = ids;
      (module.setFunctionTable as any)(length, length, ids); // because .d.ts is wrong
      if (options.optimize) module.optimize();
      if (options.validate && !module.validate()) throw new Error('validation error');
      const compiled = new WebAssembly.Module(module.emitBinary());
      const instance = new WebAssembly.Instance(compiled, imports);
      return instance.exports;
    },

    getIndirectInfo(callable: Callable) {
      return callableIndirectMap.get(callable);
    },

    getModule() {
      return module;
    },

    ...{ emitText },
  };
  return self;
};
