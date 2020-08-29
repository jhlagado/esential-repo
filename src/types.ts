import { ExpressionRef, Type } from 'binaryen';

export type Dict<T> = { [key: string]: T };
export type TypeDef = Type | Type[];

export type FuncDef = {
  arg?: Dict<TypeDef>;
  ret?: TypeDef;
  vars?: Dict<TypeDef>;
};
export type BodyDef = (
  arg?: Dict<TypeDef>,
  ret?: (expressionRef: ExpressionRef) => void,
  vars?: Dict<TypeDef>,
) => void;
// export type ValueFunc = () => ExpressionRef;
export type TupleObj = {
  expressionRef: ExpressionRef;
  typeDef: TypeDef;
};
