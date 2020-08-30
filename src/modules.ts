import { Module, createType, ExpressionRef, none } from 'binaryen';
import { BodyDef, FuncDef, Callable, Dict } from './types';
import { tuple, call } from './core';
import { stripTupleProxy } from './tuples';
import { makeDictProxy } from './variables';
import { asArray } from './utils';

let count = 0;
const nameMap = new WeakMap();

export const makeFunc = (m: Module) => (
  funcDef: FuncDef,
  bodyDef: BodyDef,
): Callable => {
  const { name = `func${count++}`, arg = {}, ret = none, vars = {} } = funcDef;
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
  m.addFunction(
    name,
    createType(Object.values(arg).map(v => createType(asArray(v)))),
    createType(asArray(ret)),
    Object.values(vars).map(v => createType(asArray(v))),
    m.block(null as any, bodyItems),
  );
  const callable = (...args: ExpressionRef[]) =>
    call(name, args, createType(asArray(ret)));
  nameMap.set(callable, name);
  return callable;
};

export const moduleExport = (m: Module, exported: Dict<Callable>) => {
  for (const [externalName, callable] of Object.entries(exported)) {
    const internalName = nameMap.get(callable);
    if (internalName) {
      m.addFunctionExport(internalName, externalName);
    }
  }
};
