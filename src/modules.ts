import { Module, createType, ExpressionRef, none } from 'binaryen';
import {
  FuncImpl,
  FuncDef,
  Callable,
  LibFunc,
  Expression,
  Lib,
  ModType,
  Dict,
  TypeDef,
} from './types';
import { call } from './core';
import { makeDictProxy } from './variables';
import { asTypeArray, assignment } from './utils';
import { CompileOptions } from './types';

const FEATURE_MULTIVALUE = 512; // hardwired because of error in enum in binaryen.js .d.ts

export const Mod = (imports: Dict<FuncDef>): ModType => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  const nameMap = new Map<Callable, string>();
  const callableMap = new Map<string, Callable>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
  Object.entries(imports).forEach(([name, { arg, ret }]) => {
    module.addFunctionImport(
      name,
      name,
      name,
      createType(
        Object.values(arg as TypeDef).map(v => createType(asTypeArray(v))),
      ),
      createType(asTypeArray(ret as TypeDef)),
    );
  });
  const { emitText } = module;
  const self: ModType = {
    lib(func: LibFunc) {
      if (libMap.has(func)) {
        return libMap.get(func);
      }
      const lib = func(self);
      Object.entries(lib).forEach(([externalName, callable]) => {
        if (exportedSet.has(callable)) {
          const internalName = nameMap.get(callable);
          if (internalName) {
            module.addFunctionExport(internalName, externalName);
            exportedSet.delete(callable);
          }
        }
      });

      libMap.set(func, lib);
      return lib;
    },

    func(funcDef: FuncDef, funcImpl: FuncImpl): Callable {
      const count = nameMap.size;
      const {
        name = `func${count}`,
        arg = {},
        ret = none,
        vars = {},
        export: exported = true,
      } = funcDef;
      if (callableMap.has(name)) {
        return callableMap.get(name) as Callable;
      }
      const varNames = Object.keys({ ...arg, ...vars });
      const bodyItems: ExpressionRef[] = [];
      const argProxy = makeDictProxy(arg, varNames, bodyItems);
      const varsProxy = makeDictProxy(vars, varNames, bodyItems);
      const retFunc = (expression: Expression) => {
        bodyItems.push(assignment(expression, ret));
      };
      funcImpl(argProxy, retFunc, varsProxy);
      const retType = createType(asTypeArray(ret));
      module.addFunction(
        name,
        createType(Object.values(arg).map(v => createType(asTypeArray(v)))),
        retType,
        Object.values(vars).map(v => createType(asTypeArray(v))),
        module.block(null as any, bodyItems),
      );
      const callable = (...args: ExpressionRef[]) => call(name, args, retType);
      nameMap.set(callable, name);
      if (exported) {
        exportedSet.add(callable);
      }
      return callable;
    },

    compile(
      imports: any = {},
      options: CompileOptions = { optimize: true, validate: true },
    ): any {
      if (options.optimize) module.optimize();
      if (options.validate && !module.validate())
        throw new Error('validation error');
      const compiled = new WebAssembly.Module(module.emitBinary());
      const instance = new WebAssembly.Instance(compiled, imports);
      return instance.exports;
    },

    getModule() {
      return module;
    },

    ...{ emitText },
  };
  return self;
};
