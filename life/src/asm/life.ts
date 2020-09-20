import { i32 } from 'binaryen';
import { builtin, LibFunc } from 'esential/src';

export const lifeLib: LibFunc = ({ module, func, literal, globals, FOR, IF }) => {
  const store = builtin(module.i32.store, i32);
  const load = builtin(module.i32.load, i32);
  const add = builtin(module.i32.add, i32);
  const mul = builtin(module.i32.mul, i32);
  const lt = builtin(module.i32.lt_u, i32);
  const eqz = builtin(module.i32.eqz, i32);
  const rem = builtin(module.i32.rem_u, i32);

  globals(
    { width: i32, height: i32, offset: i32 },
    {
      width: literal(0),
      height: literal(0),
      offset: literal(0),
    },
  );

  //globals({width: i32, height: i32, offset: i32}, mutable:{width:true})

  const set = func({ params: { x: i32, y: i32, v: i32 } }, ({ $, result }) => {
    result(
      $({
        ofs: module.global.get('offset', i32),
        // y0: mul($.y, module.global.get('width', i32)),
      }),
      // $({
      //   pos: add(add($.ofs, $.y0, $.x)),
      // }),
      // store(mul($.pos, 4), $.v),
      literal(0),
    );
  });

  const init = func({ params: { width: i32, height: i32 } }, ({ $, result }) => {
    result(
      //
      module.global.set('width', $.width),
      module.global.set('height', $.height),
      module.global.set('offset', mul($.width, $.height)),
      FOR(
        $({ j: literal(0) }),
        lt($.j, literal($.height)),
        $({ j: add($.j, literal(1)) }),
      )(
        FOR(
          $({ i: literal(0) }),
          lt($.i, literal($.width)),
          $({ i: add($.i, literal(1)) }),
        )(store(0, 0, $.i, literal(2000))),
      ),
      literal(21),
    );
  });

  const step = func({}, ({ $, result }) => {
    result(
      $({
        j: load(0, 0, literal(0)),
      }),
      $({
        k: add($.j, literal(1)),
      }),
      store(0, 0, literal(0), $.k),
      $.k,
    );
  });

  // const fill = func({ params: { x: i32, y: i32, i: i32 } }, ({ $, result }) => {
  //   result(
  //     $({
  //       j: literal(0),
  //     }),
  //     FOR(
  //       $({ i: literal(10) }),

  //       module.i32.gt_s($.i, literal(0)),
  //       $({ i: module.i32.sub($.i, literal(1)) }),
  //     )(
  //       //
  //       $({ j: module.i32.add($.j, literal(1)) }),
  //     ),
  //     $.j,
  //   );
  // });

  return {
    init,
    // fill,
    step,
  };
};
