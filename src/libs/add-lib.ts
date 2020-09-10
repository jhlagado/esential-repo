import { i32 } from 'binaryen';
import { ops } from '../core';
import { ModDef } from '../types';
import { builtin } from '../typedefs';

const add = builtin(ops.i32.add, i32);

export const addLib = ({ func }: ModDef) => {

  const addition = func(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      $.u = add($.a, $.b);
      result($.u);
    },
  );

  return {
    addition,
  };
};
