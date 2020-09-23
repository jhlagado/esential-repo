import { i32, none } from 'binaryen';
import { builtin, LibFunc } from 'esential/src';

export const lifeLib: LibFunc = ({ module, func, literal, globals, FOR, IF }) => {
  const store = builtin(
    module,
    module.i32.store,
    { offset: none, align: none, ptr: i32, value: i32 },
    i32,
  );
  const load = builtin(module, module.i32.load, { offset: none, align: none, ptr: i32 }, i32);
  const add = builtin(module, module.i32.add, { a: i32, b: i32 }, i32);
  const mul = builtin(module, module.i32.mul, { a: i32, b: i32 }, i32);
  const lt = builtin(module, module.i32.lt_u, { a: i32, b: i32 }, i32);

  globals(
    { width: i32, height: i32, offset: i32 },
    {
      width: literal(0),
      height: literal(0),
      offset: literal(0),
    },
  );

  const set = func(
    { params: { x: i32, y: i32, v: i32 }, locals: { y0: i32, pos: i32 } },
    ({ vars: { x, y, v, y0, pos, pos4, width, height, offset }, result }) => {
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
    ({ vars: { width, height, i, j }, result }) => {
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

  const step = func({}, ({ vars: { j, k }, result }) => {
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
