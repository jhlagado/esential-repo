import { Module, createType, ExpressionRef, none, expandType } from 'binaryen';
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
  VarDefs,
} from './types';
import { call } from './core';
import { getter, setter, getAssignable } from './vars';
import { setType, getType, asType, setTypeDef, getTypeDef } from './utils';
import { CompileOptions } from './types';

const FEATURE_MULTIVALUE = 512; // hardwired because of error in enum in binaryen.js .d.ts

export const Mod = (imports: Dict<FuncDef>): ModType => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  const nameMap = new Map<Callable, string>();
  const callableMap = new Map<string, Callable>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
  Object.entries(imports).forEach(([name, { arg, result: ret }]) => {
    module.addFunctionImport(
      name,
      name,
      name,
      createType(Object.values(arg as TypeDef).map(asType)),
      asType(ret as TypeDef),
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
      try {
        const count = nameMap.size;
        const {
          name = `func${count}`,
          arg = {},
          result: ret = none,
          locals = {},
          export: exported = true,
        } = funcDef;
        const bodyItems: ExpressionRef[] = [];
        if (callableMap.has(name)) {
          return callableMap.get(name) as Callable;
        }
        const varDefs = { ...arg, ...locals };
        const varsProxy = new Proxy(varDefs, {
          get: getter,
          set(varDefs: VarDefs, prop: string, expression: Expression) {
            const expr = setter(varDefs, prop, expression);
            bodyItems.push(expr);
            return true;
          },
        });

        const retFunc = (expression: Expression) => {
          const expr = getAssignable(expression);
          const typeDef = getTypeDef(expr);
          if (asType(typeDef) != asType(ret)) {
            throw new Error(
              `Wrong return type, expected  ${ret} and got ${typeDef}`,
            );
          }
          bodyItems.push(expr);
        };
        funcImpl(varsProxy, retFunc);

        const argType = createType(Object.values(arg).map(asType));
        const retType = asType(ret);
        const localType = Object.values(varDefs).slice(Object.values(arg).length).map(asType);

        module.addFunction(
          name,
          argType,
          retType,
          localType,
          module.block(null as any, bodyItems),
        );
        const callable = (...args: ExpressionRef[]) => {
          const expr = call(name, args, retType);
          setTypeDef(expr, ret);
          return expr;
        };
        nameMap.set(callable, name);
        if (exported) {
          exportedSet.add(callable);
        }
        return callable;
      } catch (error) {
        console.error(error);
        throw error;
      }
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
