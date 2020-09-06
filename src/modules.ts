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

export const Mod = (imports: Dict<FuncDef>): ModType => {
  const module = new Module();
  module.setFeatures(FEATURE_MULTIVALUE);
  const nameMap = new Map<Callable, string>();
  const callableMap = new Map<string, Callable>();
  const libMap = new Map<LibFunc, Lib>();
  const exportedSet = new Set<Callable>();
  Object.entries(imports).forEach(([name, { args: arg, result: ret }]) => {
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
          args: argDefs = {},
          result = auto,
          locals: localDefs = {},
          export: exported = true,
        } = funcDef;
        const bodyItems: ExpressionRef[] = [];
        if (callableMap.has(name)) {
          return callableMap.get(name) as Callable;
        }
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
          bodyItems.push(expr);
        };
        funcImpl(varsProxy, resultFunc);
        const argType = createType(Object.values(argDefs).map(asType));
        const localType = Object.values(varDefs)
          .slice(Object.values(argDefs).length)
          .map(asType);

        const resultType = asType(resultDef);
        const callable = (...args: ExpressionRef[]) => {
          const expr = call(name, args, resultType);
          setTypeDef(expr, resultDef);
          return expr;
        };
        nameMap.set(callable, name);
        if (exported) {
          exportedSet.add(callable);
        }
        module.addFunction(
          name,
          argType,
          resultType,
          localType,
          module.block(null as any, bodyItems),
        );
        return callable;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },

    compile(imports: any = {}, options: CompileOptions = { optimize: true, validate: true }): any {
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
