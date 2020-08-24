import { Module, ExpressionRef, Type } from 'binaryen';

export type Dict<T> = { [key: string]: T };
export type TypeDef = Type | Type[];
export type FuncTypeDef = [TypeDef, TypeDef, Type[]];
export type BodyDef = (accessors: Accessor[]) => ExpressionRef[];
export type FuncDef = [FuncTypeDef, BodyDef];
export type ModuleDef = (mod: Module) => Dict<FuncDef>;

export type Accessor = (value?: ExpressionRef) => ExpressionRef;
export type AccessorMaker = (mod: Module, index: number, typ: Type) => Accessor;
