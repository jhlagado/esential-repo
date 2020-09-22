import { i32 } from 'binaryen';
import { LibFunc, builtin } from 'esential/src';

export const addLib: LibFunc = ({ func, module, literal }) => {
  const add = builtin(module, module.i32.add, i32);

  const addition = func(
    { params: { a: i32, b: i32 } },

    ({ vars: { a, b, u }, result }) => {
      result(
        //
        u(add(a(), b())),
        u(),
      );
    },
  );

  const increment = func(
    { params: { a: i32 } },

    ({ vars: { a, u }, result }) => {
      result(
        //
        u(add(a(), 1)),
        u(),
      );
    },
  );

  return {
    addition,
    increment,
  };
};
