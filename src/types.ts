import { ExpressionRef, Type } from 'binaryen';

export type Dict<T> = { [key: string]: T };
export type Expression = ExpressionRef | ExpressionRef[] | Dict<ExpressionRef>;
export type TypeDef = Type | Type[] | Dict<Type>;
export type TupleObj = {
  expressionRef: ExpressionRef;
  typeDef: TypeDef;
};

export type FuncDef = {
  name?: string;
  arg?: Dict<TypeDef>;
  ret?: TypeDef;
  vars?: Dict<TypeDef>;
  export?: boolean;
};
export type Var = Dict<any>;
export type RetFunc = (expressionRef: ExpressionRef) => void;
export type BodyDef = (arg: Var, ret: RetFunc, vars: Var) => void;

export type InitFunc = (mod: ModType) => Dict<Callable>;
export type Callable = (...args: ExpressionRef[]) => ExpressionRef;
export type CompileOptions = {
  optimize?: boolean;
  validate?: boolean;
};
export type Lib = Dict<Callable>;
export type ModType = {
  initLib: (func: InitFunc) => any;
  makeFunc: (funcDef: FuncDef, bodyDef: BodyDef) => Callable;
  compile: (imports?: any, options?: CompileOptions) => any;
  emitText: () => string;
};
