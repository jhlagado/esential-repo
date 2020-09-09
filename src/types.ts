import { ExpressionRef, Type, Module } from 'binaryen';

export type MapFunc<T, R> = (item: T) => R;
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

export type ResultFunc = (...exprs: ExpressionRef[]) => void;
export type BlockFunc = (...exprs: ExpressionRef[]) => ExpressionRef;
export type FuncImplDef = {
  $: Vars;
  result: ResultFunc;
  block: BlockFunc;
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

export type ModDef = {
  lib: (func: LibFunc, args?: Dict<any>) => any;
  memory: (def: MemDef) => void;
  external: (def: ExternalDef, fn: Function) => Callable;
  func: (def: FuncDef, funcImpl: FuncImpl) => Callable;
  indirect: (def: FuncDef, funcImpl: FuncImpl) => any;
  compile: (options?: CompileOptions) => any;
  getIndirectInfo(callable: Callable): IndirectInfo | undefined;
  getModule(): Module;
  emitText: () => string;
};
