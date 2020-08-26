import { Module, createType, ExpressionRef } from 'binaryen';
import { Accessor, TypeDef, BodyDef, FuncDef } from './types';
import { call, local, tuple } from './core';

export const NIL: number[] = [];
export const asArray = (arg: any) => (Array.isArray(arg) ? arg : [arg]);

export const makeFunc = (m: Module) => (
  name: string,
  def: FuncDef,
  body: BodyDef,
  exported = true,
) => {
  const [arg, ret, vars] = def;
  const accessors: Accessor[] = [
    ...Object.values(asArray(arg)),
    ...Object.values(vars),
  ].map((typeDef: TypeDef, index: number) => {
    const typ = createType(asArray(typeDef));
    const f = (...args: ExpressionRef[]) => {
      switch (args.length) {
        case 0:
          return local.get(index, typ);
        case 1:
          return local.set(index, args[0]);
        default:
          return local.set(index, tuple.make(args));
      }
    };
    return new Proxy<Accessor>(f, {
      get(target: Accessor, i: number) {
        return tuple.extract(target(), i);
      },
    });
  });

  m.addFunction(
    name,
    createType(asArray(arg)),
    createType(asArray(ret)),
    vars.map(v => createType(asArray(v))),
    m.block(null as any, body(accessors)),
  );

  if (exported) m.addFunctionExport(name, name);

  const func = (...args: ExpressionRef[]) =>
    call(name, args, createType(asArray(ret)));
  func.types = {
    arg,
    ret,
    vars,
  };

  return func;
};
