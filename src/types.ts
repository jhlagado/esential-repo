import { ExpressionRef, Type, Module } from 'binaryen';

export type Dict<T> = { [key: string]: T };
export type Expression = ExpressionRef | ExpressionRef[] | Dict<ExpressionRef>;
export type TypeDef = Type | Type[] | Dict<Type>;
export type TupleObj = {
  expr: ExpressionRef;
  typeDef: TypeDef;
};

export type VarDefs = Dict<TypeDef>;
export type Vars = Dict<any>;

export type FuncDef = {
  namespace?: string;
  name?: string;
  id?: string;
  args?: VarDefs;
  result?: TypeDef;
  locals?: VarDefs;
  export?: boolean;
};
export type CallbackFunc = (expr?: ExpressionRef) => void;
export type FuncImpl = (variables: Vars, result: CallbackFunc, effect: CallbackFunc) => void;

export type LibFunc = (mod: ModDef) => Dict<Callable>;
export type Callable = (...args: ExpressionRef[]) => ExpressionRef;
export type CompileOptions = {
  optimize?: boolean;
  validate?: boolean;
};
export type Lib = Dict<Callable>;

export type ModDef = {
  lib: (func: LibFunc) => any;
  imp: (funcDef: FuncDef, fn: Function) => Callable;
  func: (funcDef: FuncDef, funcImpl: FuncImpl) => Callable;
  getModule: Function;
};

export type ModType = ModDef & {
  compile: (options?: CompileOptions) => any;
  getModule(): Module;
  emitText: () => string;
};
