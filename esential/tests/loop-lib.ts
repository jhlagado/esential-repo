import { i32 } from 'binaryen';
import { ops, LibFunc } from 'esential/src';

export const loopLib: LibFunc = ({ module, func, FOR }) => {
  const {
    i32: { add, sub, gt_s: gt },
  } = ops(module);

  const looper = func({}, ({ vars: { i, j }, result }) => {
    result(
      j(0),
      FOR(
        i(10),
        gt(i, 0),
        i(sub(i, 1)),
      )(
        //
        j(add(j, 1)),
      ),
      j,
    );
  });

  return {
    looper,
  };
};
