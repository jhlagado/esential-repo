import { Entry, Dict } from './types';

export const isPrimitive = <T>(value: any): value is T =>
  Number.isInteger(value);

export const isArray = <T>(value: T[] | Dict<T>): value is T[] => Array.isArray(value);

export const asPages = (bytes: number) => ((bytes + 0xffff) & ~0xffff) >>> 16;
export const asBytes = (pages: number) => pages << 16;
