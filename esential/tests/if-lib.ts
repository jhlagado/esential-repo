import { i32 } from 'binaryen';
import { builtin, LibFunc } from 'esential/src';
import { ioLib } from './io-lib';

export const ifLib: LibFunc = ({ module, lib, func, literal, FOR, IF }) => {
  const { log } = lib(ioLib);
  const add = builtin(module, module.i32.add, { a: i32, b: i32 }, i32);
  const lt = builtin(module, module.i32.lt_u, { a: i32, b: i32 }, i32);
  const rem = builtin(module, module.i32.rem_u, { a: i32, b: i32 }, i32);
  const eqz = builtin(module, module.i32.eqz, { a: i32 }, i32);

  const oddeven = func({}, ({ vars: { odd, even, i }, result }) => {
    result(
      odd(literal(0)),
      even(literal(0)),
      FOR(
        i(literal(0)),
        lt(i(), literal(10)),
        i(add(i(), literal(1))),
      )(
        IF(eqz(rem(i(), literal(2))))(even(add(even(), literal(1))))(
          odd(add(odd(), literal(1))),
          log(odd()),
        ),
      ),
      odd(),
    );
  });

  return {
    oddeven,
  };
};
