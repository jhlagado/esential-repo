import { i32 } from 'binaryen';
import { LibFunc } from '../../esential/types';

export const lifeLib: LibFunc = ({ module: m, func, literal, FOR }) => {
  const init = func({ params: { width: i32, height: i32 } }, ({ $, result }) => {
    result(literal(1000));
  });

  const fill = func({ params: { x: i32, y: i32, i: i32 } }, ({ $, result }) => {
    result(
      $({
        j: literal(0),
      }),
      FOR(
        $({ i: literal(10) }),
        
        m.i32.gt_s($.i, literal(0)),
        $({ i: m.i32.sub($.i, literal(1)) }),
      )(
        //
        $({ j: m.i32.add($.j, literal(1)) }),
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
        m.i32.gt_s($.i, literal(0)),
        $({ i: m.i32.sub($.i, literal(1)) }),
      )(
        //
        $({ j: m.i32.add($.j, literal(1)) }),
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
