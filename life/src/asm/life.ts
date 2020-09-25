import { i32, none } from 'binaryen';
import { LibFunc } from 'esential';

export const lifeLib: LibFunc = ({ ops, func, globals, FOR }) => {
  const {store, load, add, mul, lt}=ops.i32;

  globals(
    { width: i32, height: i32, offset: i32 },
    {
      width: 0,
      height: 0,
      offset: 0,
    },
  );

  const set = func(
    { params: { x: i32, y: i32, v: i32 }, locals: { y0: i32, pos: i32 } },
    (result, { x, y, v, y0, pos, pos4, width, offset }) => {
      result(
        y0(mul(y(), width())),
        pos(add(add(offset(), y0()), x())),
        pos4(mul(pos(), 4)),
        store(0, 0, pos4(), v()),
        0,
      );
    },
  );

  const init = func({ params: { w: i32, h: i32 } }, (result, { width, height, offset, w, h, i, j }) => {
    result(
      //
      width(w),
      height(h),
      offset(mul(w, h)),
      FOR(
        j(0),
        lt(j(), height()),
        j(add(j(), 1)),
      )(FOR(i(0), lt(i(), width()), i(add(i(), 1)))(store(0, 0, i(), 2000))),
      21,
    );
  });

  const step = func({}, (result, { j, k }) => {
    result(
      //
      j(load(0, 0, 0)),
      k(add(j(), 1)),
      store(0, 0, 0, k()),
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
