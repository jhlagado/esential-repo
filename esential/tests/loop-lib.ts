import { i32 } from 'binaryen';
import { LibFunc } from 'esential/src';

export const loopLib: LibFunc = ({ builtin, func, FOR }) => {
  const {
    i32: { add, sub, gt_s: gt },
  } = builtin;

  const looper = func({}, ({ i, j }, result) => {
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
