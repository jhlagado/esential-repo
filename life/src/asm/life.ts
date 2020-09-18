import { i32 } from 'binaryen';
import { builtin, LibFunc } from 'esential/src/esential';

export const lifeLib: LibFunc = ({ module, func, literal, FOR }) => {
  const store = builtin(module.i32.store, i32);
  const load = builtin(module.i32.load, i32);

  const init = func({ params: { width: i32, height: i32 } }, ({ $, result }) => {
    result(
      //
      store(0, 0, literal(0), $.width),
      load(0, 0, literal(0)),
    );
  });

  const fill = func({ params: { x: i32, y: i32, i: i32 } }, ({ $, result }) => {
    result(
      $({
        j: literal(0),
      }),
      FOR(
        $({ i: literal(10) }),

        module.i32.gt_s($.i, literal(0)),
        $({ i: module.i32.sub($.i, literal(1)) }),
      )(
        //
        $({ j: module.i32.add($.j, literal(1)) }),
      ),
      $.j,
    );
  });

  const step = func({}, ({ $, result }) => {
    result(
      $({
        j: literal(0),
      }),
      FOR(
        $({ i: literal(10) }),
        module.i32.gt_s($.i, literal(0)),
        $({ i: module.i32.sub($.i, literal(1)) }),
      )(
        //
        $({ j: module.i32.add($.j, literal(1)) }),
      ),
      $.j,
    );
  });

  return {
    init,
    fill,
    step,
  };
};
