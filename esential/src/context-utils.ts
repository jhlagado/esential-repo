import { Module } from 'binaryen';
import {
  IndirectInfo,
  Dict,
  MemoryDef,
  TableDef,
  CompileOptions,
} from './types';

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
  imports: Dict<Dict<any>> = { env: {} },
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
