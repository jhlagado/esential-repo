import { i32 } from 'binaryen';
import { LibFunc } from '../types';
import { builtin } from '../typedefs';

export const addLib: LibFunc = ({ func, module }) => {
  const add = builtin(module.i32.add, i32);

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
