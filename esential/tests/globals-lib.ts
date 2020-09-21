import { i32 } from 'binaryen';
import { builtin, LibFunc } from 'esential/src';

export const globalsLib: LibFunc = ({ func, literal, globals, module }) => {
  const add = builtin(module.i32.add, i32);

  globals(
    { g1: i32 },
    {
      g1: literal(999),
    },
  );

  const global1000 = func({}, ({ vars: { u, g1 }, result }) => {
    result(u(add(g1(), literal(1))), u());
  });

  return {
    global1000,
  };
};
