import { LibFunc } from '../types';
import { ioLib } from './io-lib';

export const ifLib: LibFunc = ({ module: m, lib, func, literal, FOR, IF }) => {
  const { log } = lib(ioLib);

  const {
    i32: { add, lt_u: lt, rem_u: rem, eqz },
  } = m;
  const oddeven = func({}, ({ $, result }) => {
    result(
      $({
        odd: literal(0),
        even: literal(0),
      }),
      FOR(
        $({ i: literal(0) }),
        lt($.i, literal(10)),
        $({ i: add($.i, literal(1)) }),
      )(
        IF(eqz(rem($.i, literal(2))))(
          $({
            even: add($.even, literal(1)),
          }),
        )(
          $({
            odd: add($.odd, literal(1)),
          }),
          log($.odd),
        ),
      ),
      $.odd,
    );
  });

  return {
    oddeven,
  };
};
