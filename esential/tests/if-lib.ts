import { LibFunc } from 'esential/src';
import { ioLib } from './io-lib';

export const ifLib: LibFunc = ({ builtin, lib, func, FOR, IF }) => {
  const { log } = lib(ioLib);
  const {
    i32: { add, lt_u: lt, rem_u: rem, eqz },
  } = builtin;

  const oddeven = func({}, (result, { odd, even, i }) => {
    result(
      odd(0),
      even(0),
      FOR(
        i(0),
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
      odd(),
    );
  });

  return {
    oddeven,
  };
};
