import { Module, createType, ExpressionRef, Type, none, i32 } from 'binaryen';
import { TypeDef, Dict, BodyDef, TupleObj, FuncDef } from './types';
import { local, tuple, prims, call } from './core';

export const asArray = (arg: any) => (Array.isArray(arg) ? arg : [arg]);

const isPrimitive = (arg: any) => {
  const type = typeof arg;
  return arg == null || (type != 'object' && type != 'function');
};

export const val = (value: number, typeDef: Type = i32): ExpressionRef => {
  if (typeDef in prims) {
    // override type checking because of error in type definition for i64.const
    return (prims[typeDef] as any).const(value);
  }
  throw `Can only use primtive types in val, not ${typeDef}`;
};

const tupleProxies = new WeakSet();

export const makeTupleProxy = (
  expressionRef: ExpressionRef,
  typeDef: TypeDef,
): TupleObj => {
  const proxy = new Proxy(new Number(expressionRef), {
    get(target: any, prop: number | string) {
      if (prop === 'valueOf') {
        return () => expressionRef;
      } else if (Array.isArray(typeDef)) {
        const index = prop as number;
        if (index >= typeDef.length) {
          throw `Max tuple index should be ${typeDef.length} but received ${prop}`;
        }
        return tuple.extract(expressionRef, index);
      } else {
        throw `Cannot index a primitive value`;
      }
    },
  });
  tupleProxies.add(proxy);
  return proxy;
};

export const stripTupleProxy = (expressionRef: any) => {
  return tupleProxies.has(expressionRef as any)
    ? expressionRef.valueOf()
    : expressionRef;
};

export const makeDictProxy = (
  receiver: Dict<TypeDef>,
  varNames: string[],
  bodyItems: ExpressionRef[] = [],
): Dict<TypeDef> => {
  return new Proxy(receiver, {
    get(target: any, prop: string) {
      const index = varNames.indexOf(prop);
      if (index < 0) {
        throw `Unknown variable '${prop}'`;
      }
      const typeDef = target[prop];
      return Array.isArray(typeDef)
        ? makeTupleProxy(local.get(index, createType(typeDef)), typeDef)
        : local.get(index, typeDef);
    },
    set(
      target: any,
      prop: string,
      expressionRef: ExpressionRef | ExpressionRef[],
    ) {
      const index = varNames.indexOf(prop);
      if (index < 0) {
        throw `Unknown variable '${prop}'`;
      }
      if (Array.isArray(expressionRef)) {
        bodyItems.push(local.set(index, tuple.make(expressionRef)));
      } else {
        bodyItems.push(local.set(index, stripTupleProxy(expressionRef)));
      }
      return true;
    },
    apply(target: any) {
      return target;
    },
  });
};

export const makeFunc = (m: Module) => (
  name: string,
  funcDef: FuncDef,
  bodyDef: BodyDef,
  exported = true,
) => {
  const { arg = {}, ret = none, vars = {} } = funcDef;
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
  console.log(JSON.stringify(bodyItems));
  m.addFunction(
    name,
    createType(Object.values(arg).map(v => createType(asArray(v)))),
    createType(asArray(ret)),
    Object.values(vars).map(v => createType(asArray(v))),
    m.block(null as any, bodyItems),
  );
  if (exported) m.addFunctionExport(name, name);
  return (...args: ExpressionRef[]) =>
    call(name, args, createType(asArray(ret)));
};
