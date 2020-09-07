import { ModDef, Dict, LibFunc } from '../types';
import { ioLib } from './io-lib';
import { literal } from '../utils';
import { i32 } from 'binaryen';

export const memoryLib: LibFunc = (
  { lib, mem, external, func }: ModDef,
  { width = 500, height = 500 }: Dict<any> = {},
) => {
  // const { log } = lib(ioLib);

  const size = ((width / 2) * height) / 2;
  // const byteSize = size * 4 * 2; // input & output (here: 4b per cell)
  const byteSize = Math.floor((1024 * 1024 * 1024) / 65536);

  const memory = mem(
    { namespace: 'env', name: 'memory' },

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

  const mem256 = func({}, ({ effect }) => {
    effect(
     log(memory(literal(0)))
      // memory(literal(0), literal(256)), log(memory(literal(0)))
    );
  });

  return {
    // memory,
    mem256,
  };
};
