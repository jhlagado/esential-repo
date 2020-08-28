import { ExpressionRef, Type } from 'binaryen';

export const TypeSym = Symbol('TypeSym');

export type Dict<T> = { [key: string]: T };
export type TypeDef = Type | Type[];

export type FuncDef = {
  arg: { [key: string]: TypeDef };
  ret: TypeDef;
  vars: { [key: string]: TypeDef };
};
export interface TypedFunc extends Function {
  [TypeSym]?: TypeDef;
}

export type BodyDef = (
  arg: Dict<TypeDef>,
  ret: TypedFunc,
  vars: Dict<TypeDef>,
) => void;
export type ValueFunc = () => ExpressionRef;
