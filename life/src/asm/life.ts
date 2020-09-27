import { f32, i32, none } from 'binaryen';
import { LibFunc } from 'esential';

export const lifeLib: LibFunc = ({
  i32: { store, load, store8, load8_u, add, sub, mul, div, lt },
  external,
  func,
  globals,
  FOR,
  IF,
}) => {
  globals(
    { width: i32, height: i32, offset: i32 },
    {
      width: 0,
      height: 0,
      offset: 0,
    },
  );

  const log = external({
    namespace: 'env',
    name: 'log',
    params: { a: i32 },
  });

  const rnd = external({
    namespace: 'env',
    name: 'rnd',
    params: {},
    result: i32,
  });

  const inc = func({ params: { a: i32 } }, (result, { a }) => {
    result(add(a, 1));
  });

  const dec = func({ params: { a: i32 } }, (result, { a }) => {
    result(sub(a, 1));
  });

  const getPos = func(
    { params: { x: i32, y: i32, ofs: i32 }, locals: { y0: i32, pos: i32, ofs: i32 } },
    (result, { x, y, y0, pos, width, offset }) => {
      result(
        //
        y0(mul(y, width)),
        pos(add(add(offset, y0), x)),
        mul(pos, 4),
      );
    },
  );

  const getPixel = func({ params: { x: i32, y: i32 } }, (result, { x, y }) => {
    result(
      //
      load(0, 0, getPos(x, y, 0)),
    );
  });

  const setPixel = func({ params: { x: i32, y: i32, v: i32 } }, (result, { offset, x, y, v }) => {
    result(
      //
      store(0, 0, getPos(x, y, offset), v),
      0,
    );
  });

  const fadePixel = func(
    { params: { x: i32, y: i32 } }, //
    (result, { x, y, pos, alpha }) => {
      result(
        //
        pos(add(getPos(x, y, 0), 3)),
        alpha(dec(load8_u(0, 0, pos))),
        IF(lt(alpha, 0))(alpha(0))(),
        store8(0, 0, pos, alpha),
        0,
      );
    },
  );

  const randomize = func({}, (result, { width, height, i, j }) => {
    result(
      //
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
        )(IF(rnd())(setPixel(i, j, 0xffffffff))(setPixel(i, j, 0x00ffffff))),
      ),
      0,
    );
  });

  const init = func(
    { params: { w: i32, h: i32 } }, //
    (result, { width, height, offset, w, h }) => {
      result(
        //
        width(w),
        height(h),
        offset(mul(w, h)),
        randomize(),
      );
    },
  );

  const step = func({}, (result, { width, height, i, j, pixel }) => {
    result(
      //
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
        )(
          //
          fadePixel(i, j),
          setPixel(i, j, getPixel(i, j)),
        ),
      ),
      0,
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
