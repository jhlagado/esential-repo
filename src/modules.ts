import { Module, createType, ExpressionRef, none } from 'binaryen';
import {
  BodyDef,
  FuncDef,
  Callable,
  InitFunc,
  Expression,
} from './types';
import { call } from './core';
import { makeDictProxy } from './variables';
import { asTypeArray, assignment } from './utils';
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
  const retFunc = (expression: Expression) => {
    bodyItems.push(assignment(expression, ret));
  };
  bodyDef(argProxy, retFunc, varsProxy);
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
