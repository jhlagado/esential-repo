import { f32, i32, none } from 'binaryen';
import { LibFunc } from 'esential';
import { RGB_ALIVE, RGB_DEAD } from '../common/constants';

export const lifeLib: LibFunc = ({
  i32: { store, load, store8, load8_u, add, sub, mul, lt, gt, eqz, eq, and, or },
  external,
  func,
  globals,
  FOR,
  IF,
  module,
}) => {
  globals(
    { width: i32, widthM1: i32, height: i32, heightM1: i32, offset: i32 },
    {
      width: 0,
      widthM1: 0,
      height: 0,
      heightM1: 0,
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

  const add1 = func({ params: { a: i32 } }, (result, { a }) => {
    result(add(a, 1));
  });

  const sub1 = func({ params: { a: i32 } }, (result, { a }) => {
    result(sub(a, 1));
  });

  const getPos = func(
    { params: { x: i32, y: i32, ofs: i32 }, locals: { y0: i32, pos: i32, ofs: i32 } },
    (result, { x, y, ofs, y0, pos, width }) => {
      result(
        //
        y0(mul(y, width)),
        pos(add(add(ofs, y0), x)), 
        mul(pos, 4),
      );
    },
  );

  const getPixel = func({ params: { x: i32, y: i32 } }, (result, { x, y }) => {
    result(
      //
      // log(99999),
      // log(getPos(x, y, 0)),
      load(0, 0, getPos(x, y, 0)),
    );
  });

  const setPixel = func({ params: { x: i32, y: i32, v: i32 } }, (result, { offset, x, y, v }) => {
    result(
      //
      store(0, 0, getPos(x, y, offset), v),
      // log(444444),
      // log(x),
      // log(y),
      // log(offset),
      // log(getPos(x, y, offset)),
      // log(v),
      0,
    );
  });

  const fadePixel = func(
    { params: { x: i32, y: i32 } }, //
    (result, { x, y, pos, alpha }) => {
      result(
        //
        pos(add(getPos(x, y, 0), 3)),
        alpha(sub1(load8_u(0, 0, pos))),
        IF(lt(alpha, 0))(alpha(0))(),
        store8(0, 0, pos, alpha),
        0,
      );
    },
  );

  const getM1 = func(
    { params: { x: i32, limit: i32 } }, //
    (result, { limit, x, temp }) => {
      result(
        //
        IF(eqz(x))(temp(sub1(limit)))(temp(sub1(x))),
        temp,
      );
    },
  );

  const getP1 = func(
    { params: { x: i32, limit: i32 } }, //
    (result, { limit, x, temp }) => {
      result(
        //
        IF(eq(x, sub1(limit)))(temp(0))(temp(add1(x))),
        temp,
      );
    },
  );

  const isAlive = func(
    { params: { x: i32, y: i32 } }, //
    (result, { x, y }) => {
      result(and(getPixel(x, y), 1));
    },
  );

  const countNeighbors = func(
    { params: { x: i32, y: i32 } }, //
    (
      result,
      { x, y, width, height, xm1, xp1, ym1, yp1, aa, ab, ac, ba, bc, ca, cb, cc, count },
    ) => {
      result(
        //
        xm1(getM1(x, width)),
        xp1(getP1(x, width)),
        ym1(getM1(y, height)),
        yp1(getP1(y, height)),
        // IF(and(eq(x, 10), eq(y, 10)))(
        //   log(0x111110),
        //   log(x),
        //   log(y),
        //   log(xm1),
        //   log(xp1),
        //   log(ym1),
        //   log(yp1),
        // )(),

        aa(isAlive(xm1, ym1)),
        ab(isAlive(x, ym1)),
        ac(isAlive(xp1, ym1)),
        ba(isAlive(xm1, y)),
        bc(isAlive(xp1, y)),
        ca(isAlive(xm1, yp1)),
        cb(isAlive(x, yp1)),
        cc(isAlive(xp1, yp1)),

        // log(0x22220),
        // log(aa),
        // log(ab),
        // log(ac),
        // log(ba),
        // log(bc),
        // log(ca),
        // log(cb),
        // log(cc),

        count(add(aa, add(ab, add(ac, add(ba, add(bc, add(ca, add(cb, cc)))))))),
        // IF(and(eq(x, 10), eq(y, 10)))(log(0x33330), log(count))(),
        count,
      );
    },
  );

  const randomize = func({}, (result, { width, height, i, j }) => {
    result(
      //
      FOR(
        j(0),
        lt(j, height),
        j(add1(j)),
      )(
        FOR(
          //
          i(0),
          lt(i, width),
          i(add1(i)),
        )(
          //
          IF(rnd())(setPixel(i, j, RGB_ALIVE))(setPixel(i, j, RGB_DEAD)),
          // IF(and(eq(j, 2), and(gt(i, 0), lt(i, 4))))(setPixel(i, j, RGB_ALIVE))(
          //   setPixel(i, j, RGB_DEAD),
          // ), 
        ),
      ),
      0,
    );
  });

  const init = func(
    { params: { w: i32, h: i32 } }, //
    (result, { width, widthM1, height, heightM1, offset, w, h }) => {
      result(
        //
        width(w),
        widthM1(sub1(w)),
        height(h),
        heightM1(sub1(h)),
        offset(mul(w, h)),
        randomize(),
      );
    },
  );

  const step = func({}, (result, { width, height, i, j, count, pixel }) => {
    result(
      //
      FOR(
        j(0),
        lt(j, height),
        j(add1(j)),
      )(
        FOR(
          //
          i(0),
          lt(i, width),
          i(add1(i)),
        )(
          // log(1111111),
          // log(i),
          // log(j),
          count(countNeighbors(i, j)),
          // log(count),
          pixel(getPixel(i, j)),
          // IF(and(eq(i, 10), eq(j, 10)))(log(pixel))(),

          IF(lt(count, 2))(pixel(RGB_DEAD))(),
          IF(gt(count, 3))(pixel(RGB_DEAD))(),
          IF(eq(count, 3))(pixel(RGB_ALIVE))(),

          // IF(and(eq(i, 10), eq(j, 10)))(log(pixel))(),
          setPixel(i, j, pixel),
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
