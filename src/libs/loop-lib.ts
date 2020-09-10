import { i32 } from 'binaryen';
import { LibFunc } from '../types';
import { ioLib } from './io-lib';
import { builtin } from '../typedefs';

export const loopLib: LibFunc = ({ lib, func, literal, module: m }) => {
  const { log } = lib(ioLib);
  const sub = builtin(m.i32.sub, i32);

  const looper = func(
    { params: { a: i32, b: i32 } },

    ({ $, exec }) => {
      $.i = literal(10);
      $.i = sub($.i, literal(1));
      exec(
        // m.drop(($.i = sub($.i,1))),
        log($.i),
      );
    },
  );

  return {
    looper,
  };
};
