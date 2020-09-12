import { i32 } from 'binaryen';
import { builtin } from '../typedefs';
import { LibFunc } from '../types';

export const loopLib: LibFunc = ({ func, module: m }) => {
  const add = builtin(m.i32.add, i32);
  const sub = builtin(m.i32.sub, i32);

  const looper = func(
    {},
    ({ $, result }) => {
      result(
        $({
          i: $(10),
          j: $(0),
        }),
        m.block('afterLoop', [
          m.loop(
            'loop',
            m.block(null as any, [
              m.br('afterLoop', m.i32.eqz(m.local.get(0, i32))),
              $({
                i: sub($.i, $(1)),
                j: add($.j, $(1)),
              }),
              m.br('loop'),
            ]),
          ),
        ]),
        $.j,
      );
    },
  );
  return {
    looper,
  };
};
