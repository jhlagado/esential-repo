import { i32 } from 'binaryen';
import { LibFunc } from '@jhlagado/esential';

export const indirectLib: LibFunc = ({ func, i32: { add } }) => {
  //
  const indirectAddition = func(
    { params: { a: i32, b: i32 }, indirect: true },

    (result, { a, b }) => {
      result(add(a, b));
    },
  );

  const indirect123 = func(
    { params: { a: i32, b: i32 }, result: i32 },

    (result, { a, b }) => {
      result(indirectAddition(a, b));
    },
  );

  return {
    indirectAddition,
    indirect123,
  };
};
