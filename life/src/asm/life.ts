import { i32, none } from 'binaryen';
import { LibFunc } from 'esential';

export const lifeLib: LibFunc = ({
  i32: { store, load, add, sub, mul, lt },
  func,
  globals,
  FOR,
}) => {
  globals(
    { width: i32, height: i32, offset: i32 },
    {
      width: 0,
      height: 0,
      offset: 0,
    },
  );

  const inc = func({ params: { a: i32 } }, (result, { a }) => {
    result(add(a, 1));
  });

  const dec = func({ params: { a: i32 } }, (result, { a }) => {
    result(sub(a, 1));
  });

  const getPos = func(
    { params: { x: i32, y: i32 }, locals: { y0: i32, pos: i32 } },
    (result, { x, y, y0, pos, width, offset }) => {
      result(
        //
        y0(mul(y, width)),
        pos(add(add(offset, y0), x)),
        mul(pos, 4),
      );
    },
  );

  const get = func({ params: { x: i32, y: i32 } }, (result, { x, y }) => {
    result(
      //
      load(0, 0, getPos(x, y)),
    );
  });

  const set = func({ params: { x: i32, y: i32, v: i32 } }, (result, { x, y, v }) => {
    result(
      //
      store(0, 0, getPos(x, y), v),
    );
  });

  const init = func(
    { params: { w: i32, h: i32 } },
    (result, { width, height, offset, w, h, i, j }) => {
      result(
        //
        width(w),
        height(h),
        offset(mul(w, h)),
        FOR(
          j(0),
          lt(j, height),
          j(inc(j)),
        )(
          FOR(
            //
            i(0),
            lt(i, width),
            i(inc(i)),
          )(store(0, 0, i, 0)),
        ),
        21,
      );
    },
  );

  const step = func({}, (result, { j, k }) => {
    result(
      //
      j(load(0, 0, 0)),
      k(inc(j)),
      store(0, 0, 0, k),
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
