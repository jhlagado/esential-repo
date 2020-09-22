import { Entry, Dict } from './types';

export const isPrimitive = <T>(value: any): value is T => Number.isInteger(value);

export const isArray = <T>(value: T[] | Dict<T>): value is T[] => Array.isArray(value);

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
  return isArray<T>(obj)
    ? obj
    : Object.keys(obj)
        .sort()
        .map(key => obj[key]);
};

