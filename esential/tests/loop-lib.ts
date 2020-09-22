import { i32 } from 'binaryen';
import { builtin, LibFunc } from 'esential/src';

export const loopLib: LibFunc = ({ module, func, FOR }) => {
  const add = builtin(module, module.i32.add, { a: i32, b: i32 }, i32);
  const sub = builtin(module, module.i32.sub, { a: i32, b: i32 }, i32);
  const gt = builtin(module, module.i32.gt_s, { a: i32, b: i32 }, i32);

  const looper = func({}, ({ vars: { i, j }, result }) => {
    result(
      j(0),
      FOR(
        i(10),
        gt(i(), 0),
        i(sub(i(), 1)),
      )(
        //
        j(add(j(), 1)),
      ),
      j(),
    );
  });

  return {
    looper,
  };
};
