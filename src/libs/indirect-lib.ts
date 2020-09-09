import { i32 } from 'binaryen';
import { ops } from '../core';
import { ModDef } from '../types';
import { builtin } from '../utils';

const {
  i32: { add },
} = ops;

const add1 = builtin(add, i32);

export const indirectLib = ({ lib, func, indirect }: ModDef) => {
  const indirectAddition = indirect(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      result(add1($.a, $.b));
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
