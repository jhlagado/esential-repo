import { ModDef, Dict, LibFunc } from '../types';
import { builtin, literal } from '../utils';
import { i32 } from 'binaryen';
import { ops } from '../core';

const load = builtin(ops.i32.load, i32);
const store = builtin(ops.i32.store, i32);

export const memoryLib: LibFunc = (
  { memory, external, func }: ModDef,
  { width = 500, height = 500 }: Dict<any> = {},
) => {
  // const { log } = lib(ioLib);
  // const byteSize = size * 4 * 2; // input & output (here: 4b per cell)
  memory(
    { namespace: 'env', name: 'memory', initial: 10 },

    new WebAssembly.Memory({
      // initial: ((byteSize + 0xffff) & ~0xffff) >>> 16,
      initial: 10,
      maximum: 100,
    }),
  );

  const log = external(
    { namespace: 'env', name: 'log', params: { a: i32 } },

    (a: number) => {
      console.log(a);
      return;
    },
  );

  const mem256 = func({ result: [i32] }, ({ $, block, result }) => {
    $.u = block(store(0, 0, literal(0), literal(346)), load(0, 0, literal(0)));
    result(log(literal(1)), $.u);
  });

  return {
    // memory,
    mem256,
  };
};
