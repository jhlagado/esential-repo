import { i32 } from 'binaryen';
import { builtin, LibFunc } from 'esential/src';

export const loopLib: LibFunc = ({ module, func, literal, FOR }) => {

  const add = builtin(module, module.i32.add, [i32, i32], i32);
  const sub = builtin(module, module.i32.sub, [i32, i32], i32);
  const gt = builtin(module, module.i32.gt_s, [i32, i32], i32);

  const looper = func({}, ({ vars: { i, j }, result }) => {
    result(
      j(literal(0)),
      FOR(
        i(literal(10)),
        gt(i(), literal(0)),
        i(sub(i(), literal(1))),
      )(
        //
        j(add(j(), literal(1))),
      ),
      j(),
    );
  });

  return {
    looper,
  };
};
