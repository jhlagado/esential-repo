import { i32 } from 'binaryen';
import { ops } from '../core';
import { LibFunc } from '../types';
import { builtin } from '../typedefs';

const add = builtin(ops.i32.add, i32);

export const indirectLib: LibFunc = ({ func, indirect }) => {
  const indirectAddition = indirect(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      result(add($.a, $.b));
    },
  );

  const indirect123 = func(
    { params: { a: i32, b: i32 }, result: i32 },

    ({ $, result }) => {
      result(indirectAddition($.a, $.b));
    },
  );

  return {
    indirectAddition,
    indirect123,
  };
};
