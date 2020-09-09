import { i32 } from 'binaryen';
import { ops } from '../core';
import { ModDef } from '../types';
import { builtin } from '../utils';

const {
  i32: { add },
} = ops;

const add1 = builtin(add, i32);

export const addLib = ({ func }: ModDef) => {

  const addition = func(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      $.u = add1($.a, $.b);
      result($.u);
    },
  );

  return {
    addition,
  };
};
