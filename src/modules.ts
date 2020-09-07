import { Module, createType, ExpressionRef, none, auto, i32 } from 'binaryen';
import {
  FuncImpl,
  FuncDef,
  Callable,
  LibFunc,
  Expression,
  Lib,
  ModType,
  VarDefs,
  Dict,
  ExternalDef,
  MemDef,
} from './types';
import { call } from './core';
import { getter, setter, getAssignable, inferTypeDef } from './vars';
import { asType, setTypeDef, getTypeDef } from './utils';
import { CompileOptions } from './types';

const FEATURE_MULTIVALUE = 512; // hardwired because of error in enum in binaryen.js .d.ts

export const Mod = (): ModType => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  module.autoDrop();

  let imports: Dict<Dict<any>> = {};
  const callableIdMap = new Map<Callable, string>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
  const { emitText } = module;
  const self: ModType = {
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

    mem(def: MemDef, memObj: any): any {
      const count = callableIdMap.size;
      const { namespace = 'namespace', name = 'name', id = `func${count}` } = def;
      imports = {
        ...imports,
        [namespace]: {
          ...imports[namespace],
          [name]: memObj,
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const callable = (...params: ExpressionRef[]) => {
          const [index = 0, value = 0] = params;
          // const expr = module.i32.load(0,0,index);
          const expr = index;
          setTypeDef(expr, i32);
          return expr;
        } /* TODO a mem access function*/;
      callableIdMap.set(callable, id);
      const memSize = 10;
      module.addMemoryImport(id, namespace, name);
      module.setMemory(10, 200, name);
      // module.addMemoryExport(id, name);
      return callable;
    },

    external(def: ExternalDef, fn: Function): Callable {
      const count = callableIdMap.size;
      const {
        namespace = 'namespace',
        name = 'name',
        id = `func${count}`,
        params: paramDefs = {},
        result: resultDef = none,
      } = def;
      const argType = createType(Object.values(paramDefs).map(asType));
      const resultType = asType(resultDef);
      const callable = (...params: ExpressionRef[]) => {
        const expr = call(id, params, resultType);
        setTypeDef(expr, resultDef);
        return expr;
      };
      callableIdMap.set(callable, id);
      imports = {
        ...imports,
        [namespace]: {
          ...imports[namespace],
          [name]: fn,
        },
      };
      module.addFunctionImport(id, namespace, name, argType, resultType);
      return callable;
    },

    func(def: FuncDef, funcImpl: FuncImpl): Callable {
      const count = callableIdMap.size;
      const {
        id = `func${count}`,
        params: paramDefs = {},
        result = auto,
        locals: localDefs = {},
        export: exported = true,
      } = def;
      const bodyItems: ExpressionRef[] = [];
      const varDefs = { ...paramDefs, ...localDefs };
      const varsProxy = new Proxy(varDefs, {
        get: getter,
        set(varDefs: VarDefs, prop: string, expression: Expression) {
          const expr = setter(varDefs, prop, expression);
          bodyItems.push(expr);
          return true;
        },
      });
      let resultDef = result;
      const resultFunc = (expression: Expression) => {
        const expr = getAssignable(expression);
        if (resultDef === auto) {
          const typeDef = inferTypeDef(expr);
          if (typeDef == null) {
            throw new Error(`Couldn't infer ${expr}`);
          }
          resultDef = typeDef;
          setTypeDef(expr, resultDef);
        } else {
          const exprTypeDef = getTypeDef(expr);
          if (asType(exprTypeDef) != asType(resultDef)) {
            throw new Error(`Wrong return type, expected ${resultDef} and got ${exprTypeDef}`);
          }
        }
        bodyItems.push(module.return(expr));
      };
      const effectFunc = (...expressions: Expression[]) => {
        expressions.map(expression => {
          const expr = getAssignable(expression);
          bodyItems.push(expr);
        });
      };
      funcImpl({ $: varsProxy, result: resultFunc, effect: effectFunc });
      if (resultDef === auto) {
        resultDef = none;
      }
      const argType = createType(Object.values(paramDefs).map(asType));
      const localType = Object.values(varDefs)
        .slice(Object.values(paramDefs).length)
        .map(asType);

      const resultType = asType(resultDef);
      const callable = (...params: ExpressionRef[]) => {
        const expr = call(id, params, resultType);
        setTypeDef(expr, resultDef);
        return expr;
      };
      callableIdMap.set(callable, id);
      if (exported) {
        exportedSet.add(callable);
      }
      module.addFunction(id, argType, resultType, localType, module.block(null as any, bodyItems));
      return callable;
    },

    compile(options: CompileOptions = { optimize: true, validate: true }): any {
      if (options.optimize) module.optimize();
      if (options.validate && !module.validate()) throw new Error('validation error');
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
