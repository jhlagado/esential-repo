import { LibFunc } from '@jhlagado/esential';

export const loopLib: LibFunc = ({ block, func, FOR, i32: { add, sub, gt } }) => {
  //

  const looper = func({}, (result, { i, j }) => {
    result(
      FOR(
        block(
          //
          j(0),
          i(10),
        ),
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
