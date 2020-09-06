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
  name?: string;
  args?: VarDefs;
  result?: TypeDef;
  locals?: VarDefs;
  export?: boolean;
};
export type RetFunc = (expr: ExpressionRef) => void;
export type FuncImpl = (variables: Vars, result: RetFunc) => void;

export type LibFunc = (mod: ModDef) => Dict<Callable>;
export type Callable = (...args: ExpressionRef[]) => ExpressionRef;
export type CompileOptions = {
  optimize?: boolean;
  validate?: boolean;
};
export type Lib = Dict<Callable>;

export type ModDef = {
  lib: (func: LibFunc) => any;
  func: (funcDef: FuncDef, funcImpl: FuncImpl) => Callable;
};

export type ModType = ModDef & {
  compile: (imports?: any, options?: CompileOptions) => any;
  getModule(): Module;
  emitText: () => string;
};
