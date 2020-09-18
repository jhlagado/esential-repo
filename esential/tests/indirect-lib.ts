import { i32 } from 'binaryen';
import { LibFunc, builtin } from 'esential/src';

export const indirectLib: LibFunc = ({ func, module }) => {

  const add = builtin(module.i32.add, i32);

  const indirectAddition = func(
    { params: { a: i32, b: i32 }, indirect: true },

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
