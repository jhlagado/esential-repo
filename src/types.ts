import { ExpressionRef, Type } from 'binaryen';

export type Dict<T> = { [key: string]: T };
export type TypeDef = Type | Type[];

export type FuncDef = {
  arg: { [key: string]: TypeDef };
  ret: TypeDef;
  vars: { [key: string]: TypeDef };
};
export type ValueFunc = {
  (): ExpressionRef;
  type: TypeDef;
};
