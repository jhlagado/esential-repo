import { Module, ExpressionRef, Type } from 'binaryen';

export type Dict<T> = { [key: string]: T };
export type Accessor = (value?: ExpressionRef) => ExpressionRef;
export type TypeDef = Type | Type[];

export type BodyDef = (accessors: Accessor[]) => ExpressionRef[];
export type FuncDef = [TypeDef, TypeDef, TypeDef[], BodyDef];
export type ModuleDef = (mod: Module) => Dict<FuncDef>;
