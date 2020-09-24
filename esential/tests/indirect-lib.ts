import { i32 } from 'binaryen';
import { LibFunc, ops } from 'esential/src';

export const indirectLib: LibFunc = ({ func, module }) => {
  const {
    i32: { add,  },
  } = ops(module);

  const indirectAddition = func(
    { params: { a: i32, b: i32 }, indirect: true },

    ({ vars: { a, b }, result }) => {
      result(add(a, b));
    },
  );

  const indirect123 = func(
    { params: { a: i32, b: i32 }, result: i32 },

    ({ vars: { a, b }, result }) => {
      result(indirectAddition(a, b));
    },
  );

  return {
    indirectAddition,
    indirect123,
  };
};
