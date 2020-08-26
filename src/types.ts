import { ExpressionRef, Type } from 'binaryen';

export type Accessor = ((...args: ExpressionRef[]) => ExpressionRef) | any[number];
export type TypeDef = Type | Type[];

export type BodyDef = (accessors: Accessor[]) => ExpressionRef[];
export type FuncDef = [TypeDef, TypeDef, TypeDef[]];
