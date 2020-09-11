import { auto, i32, none } from 'binaryen';
import { LibFunc } from '../types';
import { ioLib } from './io-lib';
import { builtin } from '../typedefs';

export const loopLib: LibFunc = ({ lib, func, literal, module: m }) => {
  const { log } = lib(ioLib);
  const get = builtin(m.local.get, i32);
  const set = builtin(m.local.set, i32);
  const drop = builtin(m.drop, none);
  const sub = builtin(m.i32.sub, i32);
  const block = builtin(m.block, auto);
  const loop = builtin(m.loop, none);
  const br = builtin(m.br, none);

  const looper = func(
    { params: { a: i32, b: i32 } },

    ({ $, exec, result }) => {
      $.i = literal(1);
      result(
        log(
          block('while', [
            set(2, sub(get(2, i32), literal(1))),
            // ($.i = sub($.i, literal(1))),
            m.br('while', 1, literal(2000)),
            (m.i32.eq(literal(0), literal(0))),
            // literal(m.i32.ne(literal(0), literal(0)), literal(2000)),
            // literal(5000),
            // $.i,
            // literal(1000),
            // log(($.i = sub($.i, literal(1)))),
            //   // (loop as any)('loop', [
            //   //   //
            //   //   // log($.i),
            //   br('while', ($.i = sub($.i, literal(1)))),
            //   log(literal(50)),
            // br('loop'),
            //   // ]),
          ]),
        ),
        log($.i),
        log(literal(100)),
      );
    },
  );

  return {
    looper,
  };
};
