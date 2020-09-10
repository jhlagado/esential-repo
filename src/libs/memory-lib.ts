import { ModDef, Dict, LibFunc } from '../types';
import { i32 } from 'binaryen';
import { ops } from '../core';
import { builtin, literal } from '../typedefs';
import { asPages } from '../utils';

const load = builtin(ops.i32.load, i32);
const store = builtin(ops.i32.store, i32);

export const memoryLib: LibFunc = (
  { memory, func }: ModDef,
  { width = 500, height = 500 }: Dict<any> = {},
) => {
  const numBuffers = 2;
  const bytesPerPixel = 4;
  const bytes = width * height * bytesPerPixel * numBuffers;
  const pages = asPages(bytes);

  memory({ namespace: 'env', name: 'memory', initial: pages, maximum: pages });

  const storeAndLoad = func({ params: { a: i32 }, result: [i32] }, ({ $, result }) => {
    result(store(0, 0, literal(0), $.a), load(0, 0, literal(0)));
  });

  return {
    storeAndLoad,
  };
};
