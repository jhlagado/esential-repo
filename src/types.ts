import { ExpressionRef, Type, Module } from 'binaryen';

export type Entry<T> = [string, T];
export type Dict<T> = { [key: string]: T };
export type Expression = ExpressionRef | ExpressionRef[] | Dict<ExpressionRef>;
export type TypeDef = Type | Type[] | Dict<Type>;
export type TupleObj = {
  expr: ExpressionRef;
  typeDef: TypeDef;
};

export type VarDefs = Dict<TypeDef>;
export type Vars = Dict<any>;

export type ResultFunc = (expr: ExpressionRef) => void;
export type EffectFunc = (...exprs: ExpressionRef[]) => void;
export type FuncImplDef = {
  $: Vars;
  result: ResultFunc;
  effect: EffectFunc;
};
export type FuncImpl = (funcImplDef: FuncImplDef) => void;

export type LibFunc = (mod: ModDef, args?: Dict<any>) => Dict<any>;
export type Callable = (...params: ExpressionRef[]) => ExpressionRef;
export type CompileOptions = {
  optimize?: boolean;
  validate?: boolean;
};
export type Lib = Dict<Callable>;

export type MemDef = {
  namespace: string;
  name: string;
  id?: string;
  export?: boolean;
};
export type ExternalDef = {
  namespace: string;
  name: string;
  id?: string;
  params?: VarDefs;
  result?: TypeDef;
  export?: boolean;
};
export type FuncDef = {
  id?: string;
  params?: VarDefs;
  result?: TypeDef;
  locals?: VarDefs;
  export?: boolean;
};
export type ModDef = {
  lib: (func: LibFunc, args?: Dict<any>) => any;
  mem: (def: MemDef, memObj: any) => Callable;
  external: (def: ExternalDef, fn: Function) => Callable;
  func: (def: FuncDef, funcImpl: FuncImpl) => Callable;
  getModule: Function;
};

export type ModType = ModDef & {
  compile: (options?: CompileOptions) => any;
  getModule(): Module;
  emitText: () => string;
};
