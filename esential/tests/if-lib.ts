import { i32 } from 'binaryen';
import { LibFunc } from '@jhlagado/esential';
import { ioLib } from './io-lib';

export const ifLib: LibFunc = ({ lib, func, block, FOR, IF, i32: { add, lt, rem, eqz } }) => {
  //
  const { log } = lib(ioLib);

  // const isOdd = func({ params: { a: i32 } }, (result, { a }) => {
  //   result(IFF(eqz(rem(a, 2)))(100)(200));
  // });

  const oddeven = func({}, (result, { odd, even, i }) => {
    result(
      FOR(
        block(
          //
          odd(0),
          even(0),
          i(0),
        ),
        lt(i, 10),
        i(add(i, 1)),
      )(
        //
        IF(eqz(rem(i, 2)))(
          //
          even(add(even, 1)),
        )(
          //
          odd(add(odd, 1)),
          log(odd),
        ),
      ),
      odd,
    );
  });

  return {
    // isOdd,
    oddeven,
  };
};
