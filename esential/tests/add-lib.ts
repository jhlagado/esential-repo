import { i32 } from 'binaryen';
import { LibFunc, ops } from 'esential/src';

export const addLib: LibFunc = ({ func, module }) => {
  const {
    i32: { add },
  } = ops(module);

  const addition = func(
    { params: { a: i32, b: i32 } },

    ({ vars: { a, b, u }, result }) => {
      result(
        //
        u(add(a, b)),
        u,
      );
    },
  );

  const increment = func(
    { params: { a: i32 } },

    ({ vars: { a, u }, result }) => {
      result(
        //
        u(add(a, 1)),
        u,
      );
    },
  );

  return {
    addition,
    increment,
  };
};
