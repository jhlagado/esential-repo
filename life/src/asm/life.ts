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

  const set = func(
    { params: { x: i32, y: i32, v: i32 }, locals: { y0: i32, pos: i32 } },
    ({ $: { x, y, v, y0, pos, pos4, width, height, offset }, result }) => {
      result(
        y0(mul(y(), width())),
        pos(add(add(offset(), y0()), x())),
        pos4(mul(pos(), literal(4))),
        store(0, 0, pos4(), v()),
        literal(0),
      );
    },
  );

  const init = func(
    { params: { width: i32, height: i32 } },
    ({ $: { width, height, i, j }, result }) => {
      result(
        //
        module.global.set('width', width()),
        module.global.set('height', height()),
        module.global.set('offset', mul(width(), height())),
        FOR(
          j(literal(0)),
          lt(j(), height()),
          j(add(j(), literal(1))),
        )(
          FOR(
            i(literal(0)),
            lt(i(), width()),
            i(add(i(), literal(1))),
          )(store(0, 0, i(), literal(2000))),
        ),
        literal(21),
      );
    },
  );

  const step = func({}, ({ $: { j, k }, result }) => {
    result(
      //
      j(load(0, 0, literal(0))),
      k(add(j(), literal(1))),
      store(0, 0, literal(0), k()),
      k(),
    );
  });

  // const fill = func({ params: { x: i32, y: i32, i: i32 } }, ({ result }) => {
  //   result(literal(0));
  // });

  return {
    init,
    // fill,
    step,
  };
};
