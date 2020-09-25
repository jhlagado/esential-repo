import { ExpressionRef } from 'binaryen';
import { Entry, Dict, Signature, Expression } from './types';

export const isPrim = <T>(value: any): value is T => Number.isInteger(value);

export const asBool = (value: boolean) => (value ? -1 : 0);

export const asDict = <T>(entries: Entry<T>[]) =>
  entries.reduce<Dict<T>>((acc, entry) => {
    const [key, value] = entry;
    acc[key] = value;
    return acc;
  }, {});

export const asPages = (bytes: number) => ((bytes + 0xffff) & ~0xffff) >>> 16;
export const asBytes = (pages: number) => pages << 16;

export const asArray = <T>(obj: Dict<T> | T[]) => {
  return Array.isArray(obj)
    ? obj
    : Object.keys(obj)
        .sort()
        .map(key => obj[key]);
};

export const isSignature = (obj: any): obj is Signature => 'params' in obj && 'result' in obj;

export const resolveExpression = (expr: Expression): ExpressionRef => {
  return typeof expr === 'function' ? expr() : expr;
};
