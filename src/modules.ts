import { Module, createType, ExpressionRef, none, auto, i32 } from 'binaryen';
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
import { getter, setter, getAssignable, inferTypeDef } from './vars';
import { asType, setTypeDef, getTypeDef } from './utils';
import { CompileOptions } from './types';

const FEATURE_MULTIVALUE = 512; // hardwired because of error in enum in binaryen.js .d.ts

export const Mod = (): ModType => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  module.autoDrop();

  let imports = {};
  const idMap = new Map<Callable, string>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
  const { emitText } = module;
  const self: ModType = {
    lib(func: LibFunc) {
      if (libMap.has(func)) {
        return libMap.get(func);
      }
      const lib = func(self);
      Object.entries(lib).forEach(([externalName, callable]) => {
        if (exportedSet.has(callable)) {
          const internalName = idMap.get(callable);
          if (internalName) {
            module.addFunctionExport(internalName, externalName);
            exportedSet.delete(callable);
          }
        }
      });
      libMap.set(func, lib);
      return lib;
    },

    imp(funcDef: FuncDef, fn: Function): Callable {
      const count = idMap.size;
      const {
        namespace = 'namspace',
        name = 'name',
        id = `func${count}`,
        args: argDefs = {},
        result: resultDef = none,
      } = funcDef;
      const argType = createType(Object.values(argDefs).map(asType));
      const resultType = asType(resultDef);
      const callable = (...args: ExpressionRef[]) => {
        const expr = call(id, args, resultType);
        setTypeDef(expr, resultDef);
        return expr;
      };
      idMap.set(callable, id);
      imports = {
        ...imports,
        [namespace]: {
          [name]: fn,
        },
      };
      module.addFunctionImport(id, namespace, name, argType, resultType);
      return callable;
    },

    func(funcDef: FuncDef, funcImpl: FuncImpl): Callable {
      const count = idMap.size;
      const {
        id = `func${count}`,
        args: argDefs = {},
        result = auto,
        locals: localDefs = {},
        export: exported = true,
      } = funcDef;
      const bodyItems: ExpressionRef[] = [];
      const varDefs = { ...argDefs, ...localDefs };
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
      funcImpl(varsProxy, resultFunc, effectFunc);
      if (resultDef === auto) {
        resultDef = none;
      }
      const argType = createType(Object.values(argDefs).map(asType));
      const localType = Object.values(varDefs)
        .slice(Object.values(argDefs).length)
        .map(asType);

      const resultType = asType(resultDef);
      const callable = (...args: ExpressionRef[]) => {
        const expr = call(id, args, resultType);
        setTypeDef(expr, resultDef);
        return expr;
      };
      idMap.set(callable, id);
      if (exported) {
        exportedSet.add(callable);
      }
      console.log(resultType);
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
