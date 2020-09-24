import { i32 } from 'binaryen';
import { LibFunc, ops } from 'esential/src';

export const blockLib: LibFunc = ({ func, module, literal }) => {
  const {
    i32: { add },
  } = ops(module);

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
