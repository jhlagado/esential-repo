import { i32 } from 'binaryen';
import { LibFunc } from 'esential';

export const loopLib: LibFunc = ({ i32: { add, sub, gt }, func, FOR }) => {
  //
  const looper = func({}, (result, { i, j }) => {
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
