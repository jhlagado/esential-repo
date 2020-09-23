import { i32 } from 'binaryen';
import { LibFunc, builtin } from 'esential/src';

export const resultLib: LibFunc = ({ func, module }) => {
  const add = builtin(module, module.i32.add, { a: i32, b: i32 }, i32);

  const return1000 = func(
    { params: {} },

    ({ result }) => {
      result(1000);
    },
  );

  return {
    return1000,
  };
};
