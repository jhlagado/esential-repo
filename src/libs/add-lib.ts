import { i32 } from 'binaryen';
import { LibFunc, builtin } from '../esential';

export const addLib: LibFunc = ({ func, module }) => {
  const add = builtin(module.i32.add, i32);

  const addition = func(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      result(
        //
        $({ u: add($.a, $.b) }),
        $.u,
      );
    },
  );

  return {
    addition,
  };
};
