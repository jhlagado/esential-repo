import { Module, createType, ExpressionRef, Type, none } from 'binaryen';
import { TypeDef, Dict, BodyDef, TupleObj, FuncDef } from './types';
import { local, tuple, prims, call } from './core';

export const NIL: number[] = [];
export const asArray = (arg: any) => (Array.isArray(arg) ? arg : [arg]);

export const val = (value: number, typeDef: Type): ExpressionRef => {
  if (typeDef in prims) {
    // override type checking because of error in type definition for i64.const
    return (prims[typeDef] as any).const(value);
  }
  throw `Can only use primtive types in val, not ${typeDef}`;
};

export const makeTupleProxy = (
  expressionRef: ExpressionRef,
  typeDef: TypeDef,
): TupleObj =>
  new Proxy(
    { expressionRef, typeDef },
    {
      get(target: any, index: number) {
        if (Array.isArray(typeDef)) {
          if (index >= typeDef.length) {
            throw `Max tuple index should be ${typeDef.length} but received ${index}`;
          }
          return tuple.extract(expressionRef, index);
        } else {
          throw `Cannot index a primitive value`;
        }
      },
    },
  );

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
    set(target: any, prop: string, expressionRef: ExpressionRef) {
      const index = varNames.indexOf(prop);
      if (index < 0) {
        throw `Unknown variable '${prop}'`;
      }
      bodyItems.push(local.set(index, expressionRef));
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
  const retFunc = (expressionRef: ExpressionRef) => {
    bodyItems.push(expressionRef);
  };
  bodyDef(argProxy, retFunc, varsProxy);
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
