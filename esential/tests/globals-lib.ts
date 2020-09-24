import { i32 } from 'binaryen';
import { ops, LibFunc } from 'esential/src';

export const globalsLib: LibFunc = ({ func, literal, globals, module }) => {
  const {
    i32: { add },
  } = ops(module);

  globals({ g1: i32, g2: [i32, i32] }, { g1: 999, g2: [1000, 2000] });

  const global1000 = func({}, ({ vars: { u, g1 }, result }) => {
    result(u(add(g1, 1)), u());
  });

  const global2000 = func({}, ({ vars: { g2 }, result }) => {
    result(g2[1]);
  });

  return {
    global1000,
    global2000,
  };
};
