import { ExpressionRef, Type } from 'binaryen';

export type Dict<T> = { [key: string]: T };
export type TypeDef = Type | Type[];
export type FuncDef = {
  name?: string;
  arg?: Dict<TypeDef>;
  ret?: TypeDef;
  vars?: Dict<TypeDef>;
};
export type Var = Dict<ExpressionRef>;
export type RetFunc = (expressionRef: ExpressionRef) => void;
export type BodyDef = (arg: Var, ret: RetFunc, vars: Var) => void;
export type TupleObj = {
  expressionRef: ExpressionRef;
  typeDef: TypeDef;
};
export type Callable = (...args: ExpressionRef[]) => ExpressionRef;
export type CompileOptions = {
  optimize: boolean;
  validate: boolean;
};
export type MakeFunc = (funcDef: FuncDef, bodyDef: BodyDef) => Callable;
export type InitFunc = (makeFunc: MakeFunc) => Dict<Callable>;

