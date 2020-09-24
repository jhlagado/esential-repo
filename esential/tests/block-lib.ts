import { i32 } from 'binaryen';
import { LibFunc,  } from 'esential/src';

export const blockLib: LibFunc = ({ func, builtin }) => {
  const {
    i32: { add },
  } = builtin;

  const blockadd = func({ locals: { a: i32, b: i32 } }, ({ vars: { a, b, u }, result }) => {
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
