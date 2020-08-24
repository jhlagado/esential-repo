import { Module, ExpressionRef, Type } from 'binaryen';

export type Dict<T> = { [key: string]: T };
export type Accessor = (value?: ExpressionRef) => ExpressionRef;
export type TypeDef = Type | Type[];

export type FuncTypeDef = [TypeDef, TypeDef, Type[]];
export type BodyDef = (accessors: Accessor[]) => ExpressionRef[];
export type FuncDef = [FuncTypeDef, BodyDef];
export type ModuleDef = (mod: Module) => Dict<FuncDef>;

