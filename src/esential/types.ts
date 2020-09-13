import { ExpressionRef, Type, Module } from 'binaryen';

export type Ref<T> = { current: T };
export type updateFunc<T> = (item: T) => T;
export type MapFunc<T, R> = (item: T) => R;
export type Entry<T> = [string, T];
export type Dict<T> = { [key: string]: T };
export type Expression = ExpressionRef | ExpressionRef[] | Dict<ExpressionRef>;
export type TypeDef = Type | Type[] | Dict<Type>;
export type Callable = (...params: ExpressionRef[]) => ExpressionRef;
export type Lib = Dict<Callable>;

export type TupleObj = {
  expr: ExpressionRef;
  typeDef: TypeDef;
};

export type VarDefs = Dict<TypeDef>;
export type Vars = Dict<any>;
export type Imports = Dict<Dict<any>>;

export type StatementsBlockFunc<T> = (...exprs: ExpressionRef[]) => T;
export type BlockFunc = StatementsBlockFunc<ExpressionRef>;
export type VoidBlockFunc = StatementsBlockFunc<void>;

export type CompileOptions = {
  optimize?: boolean;
  validate?: boolean;
};

export type MemDef = {
  namespace: string;
  name: string;
  initial: number;
  maximum?: number;
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

export type IndirectInfo = {
  index: number;
  id: string;
  paramDefs: Dict<TypeDef>;
  resultDef: TypeDef;
};

export type VarsAccessor = {
  (value: any): ExpressionRef;
  [prop: string]: any;
};

export type FuncImplDef = {
  $: VarsAccessor;
  result: VoidBlockFunc;
};
export type Initializer = (funcImplDef: FuncImplDef) => void;

export type LibFunc = (mod: Esential, args?: Dict<any>) => Dict<any>;

export type Esential = {
  module: Module;
  compile: (options?: CompileOptions) => Uint8Array;
  external: (def: ExternalDef, fn: Function) => Callable;
  func: (def: FuncDef, funcImpl: Initializer) => Callable;
  getIndirectInfo(callable: Callable): IndirectInfo | undefined;
  indirect: (def: FuncDef, funcImpl: Initializer) => any;
  lib: (func: LibFunc, args?: Dict<any>) => any;
  literal(value: number, type?: Type): ExpressionRef;
  FOR: (
    initializer: ExpressionRef,
    condition: ExpressionRef,
    final: ExpressionRef,
  ) => (...body: ExpressionRef[]) => ExpressionRef;
  IF: (
    condition: ExpressionRef,
  ) => (...thenBody: ExpressionRef[]) => (...elseBody: ExpressionRef[]) => ExpressionRef;
  load: (binary: Uint8Array) => any;
  memory: (def: MemDef) => void;
  start: (options?: CompileOptions) => any;
};
