import { i32 } from 'binaryen';
import { LibFunc } from '@jhlagado/esential';

export const mainLib: LibFunc = ({
  i32: { store, load, store8, load8_u, add, sub, mul, div, lt, gt, eqz, eq, and, or },
  external,
  func,
}) => {
  // globals(
  //   {  },
  //   {
  //   },
  // );

  const log = external({
    namespace: 'env',
    name: 'log',
    params: { a: i32 },
  });

  const init = func(
    { params: { w: i32, h: i32 } }, //
    (result, { w, h }) => {
      result(
        //
        1234,
      );
    },
  );

  return {
    init,
  };
};
