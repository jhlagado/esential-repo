import { Module, createType, ExpressionRef, none, auto } from 'binaryen';
import {
  FuncImpl,
  FuncDef,
  Callable,
  LibFunc,
  Expression,
  Lib,
  ModDef,
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

export const Mod = (): ModDef => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  module.autoDrop();

  let imports: Dict<Dict<any>> = {};
  const callableIdMap = new Map<Callable, string>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
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

    memory(def: MemDef, memObj: any): any {
      const { namespace = 'namespace', name = 'name', initial = 10, maximum = 100 } = def;
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
      const resultFunc = (...expressions: Expression[]) => {
        const exprs = expressions.map(getAssignable);
        const { length } = exprs;
        if (length === 0) {
          throw new Error(`Result function must have at least one arg`);
        }
        bodyItems.push(...exprs.slice(0, -1));
        const [expr] = exprs.slice(-1);
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
      const blockFunc = (...expressions: Expression[]) => {
        const { length } = expressions;
        if (length === 0) {
          throw new Error(`Block must have at least one item`);
        }
        const exprs = expressions.map(getAssignable);
        const [lastExpr] = exprs.slice(-1);
        const lastTypeDef = getTypeDef(lastExpr);
        const blk = module.block(null as any, exprs, asType(lastTypeDef));
        setTypeDef(blk, lastTypeDef);
        return blk;
      };
      funcImpl({ $: varsProxy, result: resultFunc, block: blockFunc });
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
