import { i32 } from 'binaryen';
import { LibFunc, builtin } from 'esential/src';

export const blockLib: LibFunc = ({ func, module, literal }) => {
  const add = builtin(module.i32.add, i32);

  const blockadd = func({ locals: { a: i32, b: i32 } }, ({ vars: { a, b, u }, result }) => {
    result(
      //
      a(1),
      b(2),
      u(add(a(), b())),
      u(),
    );
  });

  return {
    blockadd,
  };
};
