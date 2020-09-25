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
  alt?: string;
};

export type Callable = (...params: (ExpressionRef | Accessor)[]) => ExpressionRef;
export type Lib = Dict<Callable>;

export type TupleObj = {
  expr: ExpressionRef;
  typeDef: TypeDef;
};

export type VarDefs = Dict<TypeDef>;
export type Vars = Dict<any>;
export type Imports = Dict<Dict<any>>;

export type VoidBlockFunc = (...exprs: (Expression | Accessor)[]) => void;

export type FuncDef = {
  id?: string;
  params?: VarDefs;
  result?: TypeDef;
  locals?: VarDefs;
  export?: boolean;
  indirect?: boolean;
  namespace?: string;
  name?: string;
};

export type ExternalDef = {
  id?: string;
  params?: VarDefs;
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

export type VarsAccessor = {
  [prop: string]: Accessor;
};

export type FuncImplDef = {
  vars: VarsAccessor;
  result: VoidBlockFunc;
};
export type Initializer = (result: VoidBlockFunc, vars: VarsAccessor) => void;

export type LibFunc = (mod: EsentialContext, args?: Dict<any>) => Dict<any>;

export type EsentialCfg = {
  memory?: MemoryDef;
  table?: TableDef;
};

export type EsentialContext = {
  module: Module;
  compile: (options?: CompileOptions) => Uint8Array;
  func: (def: FuncDef, funcImpl?: Initializer) => Callable;
  external: (def: ExternalDef) => Callable;
  globals: (varDefs: VarDefs, assignments: Dict<Expression>) => void;
  getIndirectInfo(callable: Callable): IndirectInfo | undefined;
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
  load: (binary: Uint8Array, imports?: Imports) => any;
  getMemory: () => MemoryDef | null;
  getTable: () => TableDef | null;
};
