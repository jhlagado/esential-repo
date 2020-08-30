import { Module, createType, ExpressionRef, none } from 'binaryen';
import { BodyDef, FuncDef, Callable, InitFunc } from './types';
import { tuple, call } from './core';
import { stripTupleProxy } from './tuples';
import { makeDictProxy } from './variables';
import { asArray } from './utils';
import { CompileOptions } from './types';

export const initMakeFunc = (module: Module, nameMap: any) => (
  funcDef: FuncDef,
  bodyDef: BodyDef,
): Callable => {
  const count = nameMap.size;
  const { name = `func${count}`, arg = {}, ret = none, vars = {} } = funcDef;
  const varNames = Object.keys({ ...arg, ...vars });
  const bodyItems: ExpressionRef[] = [];
  const argProxy = makeDictProxy(arg, varNames, bodyItems);
  const varsProxy = makeDictProxy(vars, varNames, bodyItems);
  const retFunc = (expressionRef: ExpressionRef | ExpressionRef[]) => {
    if (Array.isArray(expressionRef)) {
      bodyItems.push(tuple.make(expressionRef));
    } else {
      bodyItems.push(stripTupleProxy(expressionRef));
    }
  };
  bodyDef(argProxy, retFunc, varsProxy);
  module.addFunction(
    name,
    createType(Object.values(arg).map(v => createType(asArray(v)))),
    createType(asArray(ret)),
    Object.values(vars).map(v => createType(asArray(v))),
    module.block(null as any, bodyItems),
  );
  const callable = (...args: ExpressionRef[]) =>
    call(name, args, createType(asArray(ret)));
  nameMap.set(callable, name);
  return callable;
};

export const makeModule = (initFunc: InitFunc) => {
  const module = new Module();
  module.setFeatures(512);
  const nameMap = new Map();
  const makeFunc = initMakeFunc(module, nameMap);
  Object.entries(initFunc(makeFunc)).forEach(([externalName, callable]) => {
    const internalName = nameMap.get(callable);
    if (internalName) {
      module.addFunctionExport(internalName, externalName);
    }
  });
  return module;
};

export const moduleCompile = (
  module: Module,
  imports: any = {},
  options: CompileOptions = { optimize: true, validate: true },
): any => {
  if (options.optimize) module.optimize();
  if (options.validate && !module.validate())
    throw new Error('validation error');
  const compiled = new WebAssembly.Module(module.emitBinary());
  const instance = new WebAssembly.Instance(compiled, imports);
  return instance.exports;
};
