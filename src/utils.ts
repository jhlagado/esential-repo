import { Module, createType, ExpressionRef, Type, i32, i64 } from 'binaryen';
import {
  FuncDef,
  TypedFunc,
  TypeDef,
  Dict,
  TypeSym,
  BodyDef,
  ValueFunc,
} from './types';
import { local, tuple, primitives } from './core';

export const NIL: number[] = [];
export const asArray = (arg: any) => (Array.isArray(arg) ? arg : [arg]);

export const makeTypedProxy = (func: Function, typeDef: TypeDef): TypedFunc => {
  return new Proxy(func, {
    get(target: TypedFunc, prop: number | symbol) {
      return prop === TypeSym ? typeDef : (target as any)[prop];
    },
  });
};

export const val = (value: number, typeDef: Type): TypedFunc => {
  if (typeDef in primitives) {
    // override type checking because of error in type definition for i64.const
    return makeTypedProxy(() => (primitives[typeDef] as any).const(value), typeDef);
  }
  throw `Can only use primtive types in val, not ${typeDef}`;
};

export const makeTupleProxy = (
  valueFunc: ValueFunc,
  typeDef: TypeDef,
): TypedFunc => {
  return new Proxy(valueFunc, {
    get(target: TypedFunc, prop: number | symbol) {
      if (prop === TypeSym) {
        return typeDef;
      } else if (Number.isInteger(prop)) {
        if (Array.isArray(typeDef)) {
          const index = prop as number;
          const f = () => tuple.extract(target(), index);
          return makeTupleProxy(f, typeDef[index]);
        } else {
          throw `Cannot index a primitive value`;
        }
      }
    },
  });
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
      const t = Array.isArray(typeDef) ? createType(typeDef) : typeDef;
      const f = () => local.get(index, t);
      return Array.isArray(typeDef)
        ? makeTupleProxy(f, typeDef)
        : makeTypedProxy(f, typeDef);
    },
    set(target: any, prop: string, valueFunc: TypedFunc) {
      const index = varNames.indexOf(prop);
      if (index < 0) {
        throw `Unknown variable '${prop}'`;
      }
      bodyItems.push(local.set(index, valueFunc()));
      return true;
    },
  });
};

export const makeFunc = () => (
  name: string,
  def: FuncDef,
  bodyDef: BodyDef,
  // exported = true,
) => {
  const { arg, ret, vars } = def;
  const varNames = Object.keys({ ...arg, ...vars });
  const bodyItems: ExpressionRef[] = [];
  const argProxy = makeDictProxy(arg, varNames, bodyItems);
  const varsProxy = makeDictProxy(vars, varNames, bodyItems);
  const retFunc = makeTypedProxy((typedFunc: TypedFunc) => {
    bodyItems.push(typedFunc());
  }, ret);
  bodyDef(argProxy, retFunc, varsProxy);
  console.log(bodyItems);
  // m.addFunction(
  //   name,
  //   createType(Object.values(arg)),
  //   createType(asArray(ret)),
  //   Object.values(vars).map(v => createType(asArray(v))),
  //   m.block(null as any, body),
  // );

  // if (exported) m.addFunctionExport(name, name);

  // const func = (...args: ValueFunc[]) =>
  //   call(
  //     name,
  //     args.map(arg => arg()),
  //     createType(asArray(ret)),
  //   );

  // func.types = {
  //   arg,
  //   ret,
  //   vars,
  // };

  // return func;
};
