import { i32 } from 'binaryen';
import { LibFunc } from 'esential/src';

export const addLib: LibFunc = ({ func, builtin }) => {
  const {
    i32: { add },
  } = builtin;

  const addition = func(
    { params: { a: i32, b: i32 } },

    (vars, result) => {
      const { a, b, u } = vars;
      result(
        //
        u(add(a, b)),
        u,
      );
    },
  );

  const increment = func(
    { params: { a: i32 } },

    ({ a, u }, result) => {
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
