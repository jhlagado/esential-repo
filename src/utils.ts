import { Module, createType, ExpressionRef, i32, Type } from 'binaryen';
import { FuncDef, ValueFunc } from './types';
import { call, local, tuple, i32ops } from './core';

export const NIL: number[] = [];
export const asArray = (arg: any) => (Array.isArray(arg) ? arg : [arg]);

export const val = (value: number): ValueFunc => {
  const f = (getType = false) => (getType ? i32 : i32ops.const(value));
  f.type = i32;
  return f;
};

export const tupleAccessor = (accessor: ValueFunc) =>
  new Proxy(accessor, {
    get(target: ValueFunc, i: number) {
      const f = () => tuple.extract(target(), i);
      f.type = (target.type as Type[])[i];
      return f;
    },
  });

export const makeFunc = (m: Module) => (
  name: string,
  def: FuncDef,
  bodyDef: () => void,
  exported = true,
) => {
  const { arg, ret, vars } = def;
  const variables = { ...arg, ...vars };
  const names = Object.keys(variables);
  const accessors = new Map(
    Object.entries(variables).map(([name, typeDef], index: number) => {
      const t = Array.isArray(typeDef) ? createType(asArray(typeDef)) : typeDef;
      const f: ValueFunc = () => local.get(index, t);
      f.type = typeDef;
      return [name, f];
    }),
  );
  const body: ExpressionRef[] = [];
  const proxy = new Proxy(variables, {
    get(target: any, prop: string) {
      const accessor = accessors.get(prop);
      if (accessor == null) {
        throw `Unknown variable '${prop}'`;
      }
      const typeDef = accessor.type;
      if (Array.isArray(typeDef)) {
        return tupleAccessor(accessor);
      }
      return accessor;
    },
    set(target: any, prop: string, accessor: ValueFunc) {
      const index = names.indexOf(prop);
      if (index < 0) {
        throw `Unknown variable '${prop}'`;
      }
      body.push(local.set(index, accessor()));
      return true;
    },
    apply(target: any, thisArg: any, args: ValueFunc[]) {
      if (args.length !== 1) {
        throw `Expected 1 arg but received ${args.length}`;
      }
      const accessor = args[0];
      body.push(accessor());
    },
  });
  bodyDef.apply(proxy);

  m.addFunction(
    name,
    createType(asArray(Object.values(arg))),
    createType(asArray(ret)),
    Object.values(vars).map(v => createType(asArray(v))),
    m.block(null as any, body),
  );

  if (exported) m.addFunctionExport(name, name);

  const func = (...args: ValueFunc[]) =>
    call(
      name,
      args.map(arg => arg()),
      createType(asArray(ret)),
    );

  func.types = {
    arg,
    ret,
    vars,
  };

  return func;
};
