import { i32 } from 'binaryen';
import { LibFunc } from 'esential';

export const blockLib: LibFunc = ({ func, i32: { add } }) => {
  //
  const blockadd = func({ locals: { a: i32, b: i32 } }, (result, { a, b, u }) => {
    result(
      //
      a(1),
      b(2),
      u(add(a, b)),
      u,
    );
  });

  return {
    blockadd,
  };
};
