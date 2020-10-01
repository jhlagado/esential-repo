import { i32 } from 'binaryen';
import { LibFunc } from '../src';

export const globalsLib: LibFunc = ({ func, globals, i32: { add } }) => {
  //
  globals({ g1: i32, g2: [i32, i32] }, { g1: 999, g2: [1000, 2000] });

  const global1000 = func({}, (result, { u, g1 }) => {
    result(u(add(g1, 1)), u());
  });

  const global2000 = func({}, (result, { g2 }) => {
    result(g2[1]);
  });

  return {
    global1000,
    global2000,
  };
};
