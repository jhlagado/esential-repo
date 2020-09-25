import { ExpressionRef, Type, Module } from 'binaryen';

export type Thunk<T> = () => T;
export type Ref<T> = { current: T };
export type updateFunc<T> = (item: T) => T;
export type MapFunc<T, R> = (item: T) => R;
export type Entry<T> = [string, T];
export type Dict<T> = { [key: string]: T };
export type Expression = ExpressionRef | ExpressionRef[] | Dict<ExpressionRef>;
export type TypeDef = Type | Type[] | Dict<Type>;

export type Accessor = {
  (expression?: Expression): any;
  [key: string]: ExpressionRef;
};

export type Signature = {
  params: Dict<TypeDef>;
  result: TypeDef;
};

export type Callable = (...params: (ExpressionRef | Accessor)[]) => ExpressionRef;

export type TupleObj = {
  expr: ExpressionRef;
  typeDef: TypeDef;
};

export type VoidBlockFunc = (...exprs: (Expression | Accessor)[]) => void;

export type FuncDef = {
  id?: string;
  params?: Dict<TypeDef>;
  result?: TypeDef;
  locals?: Dict<TypeDef>;
  export?: boolean;
  indirect?: boolean;
  namespace?: string;
  name?: string;
};

export type ExternalDef = {
  id?: string;
  params?: Dict<TypeDef>;
  result?: TypeDef;
  namespace?: string;
  name?: string;
};

export type IndirectInfo = {
  index: number;
  id: string;
  paramDefs: Dict<TypeDef>;
  resultDef: TypeDef;
};

export type AllocatedDef<T> = {
  namespace?: string;
  name?: string;
  initial?: number;
  maximum?: number;
  instance?: T;
};
export type MemoryDef = AllocatedDef<WebAssembly.Memory>;
export type TableDef = AllocatedDef<WebAssembly.Table>;

export type CompileOptions = {
  optimize?: boolean;
  validate?: boolean;
  memory?: MemoryDef;
  table?: TableDef;
  debugRaw?: boolean;
  debugOptimized?: boolean;
};

export type Initializer = (result: VoidBlockFunc, vars: Dict<Accessor>) => void;

export type LibFunc = (mod: EsentialContext, args?: Dict<any>) => Dict<any>;

export type EsentialCfg = {
  memory?: MemoryDef;
  table?: TableDef;
};

export type EsentialContext = {
  func: (def: FuncDef, funcImpl?: Initializer) => Callable;
  external: (def: ExternalDef) => Callable;
  globals: (varDefs: Dict<TypeDef>, assignments: Dict<Expression>) => void;
  lib: (func: LibFunc, args?: Dict<any>) => any;
  ops: Dict<any>;
  FOR: (
    initializer: ExpressionRef,
    condition: ExpressionRef,
    final: ExpressionRef,
  ) => (...body: ExpressionRef[]) => ExpressionRef;
  IF: (
    condition: ExpressionRef,
  ) => (...thenBody: ExpressionRef[]) => (...elseBody: ExpressionRef[]) => ExpressionRef;

  module: Module;
  compile: (options?: CompileOptions) => Uint8Array;
  load: (binary: Uint8Array, imports?: Dict<Dict<any>>) => any;

  getIndirectInfo(callable: Callable): IndirectInfo | undefined;
  getMemory: () => MemoryDef | null;
  getTable: () => TableDef | null;
};
