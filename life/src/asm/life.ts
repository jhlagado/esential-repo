import { i32 } from 'binaryen';
import { FOR, IF, LibFunc, i32ops } from '../../../esential/src';
import { RGB_ALIVE, RGB_DEAD } from '../common/constants';

export const lifeLib: LibFunc = ({ external, func, globals }) => {
  //
  const { store, load, store8, load8_u, add, sub, mul, div, lt, gt, eqz, eq, and } = i32ops;

  globals(
    //
    { width: i32, height: i32, offset: i32 },
    { width: 0, height: 0, offset: 0 },
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
      load(0, 0, getPos(x, y, 0)),
    );
  });

  const setPixel = func({ params: { x: i32, y: i32, v: i32 } }, (result, { offset, x, y, v }) => {
    result(
      //
      store(0, 0, getPos(x, y, offset), v),
    );
  });

  const fadePixel = func(
    { params: { x: i32, y: i32 } }, //
    (result, { x, y, pos, alpha }) => {
      result(
        //
        pos(add(getPos(x, y, 0), 3)),
        alpha(sub(load8_u(0, 0, pos),1)),
        IF(lt(alpha, 0))(alpha(0))(),
        store8(0, 0, pos, alpha),
      );
    },
  );

  const getM1 = func(
    { params: { x: i32, limit: i32 } }, //
    (result, { limit, x }) => {
      result(
        //
        sub(IF(eqz(x))(limit)(x), 1),
      );
    },
  );

  const getP1 = func(
    { params: { x: i32, limit: i32 } }, //
    (result, { limit, x }) => {
      result(
        //
        IF(eq(x, sub(limit, 1)))(0)(add(x, 1)),
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

        aa(isAlive(xm1, ym1)),
        ab(isAlive(x, ym1)),
        ac(isAlive(xp1, ym1)),
        ba(isAlive(xm1, y)),
        bc(isAlive(xp1, y)),
        ca(isAlive(xm1, yp1)),
        cb(isAlive(x, yp1)),
        cc(isAlive(xp1, yp1)),

        add(aa, add(ab, add(ac, add(ba, add(bc, add(ca, add(cb, cc))))))),
      );
    },
  );

  const randomize = func({}, (result, { width, height, i, j }) => {
    result(
      //
      FOR(
        j(0),
        lt(j, height),
        j(add(j,1)),
      )(
        FOR(
          //
          i(0),
          lt(i, width),
          i(add(i,1)),
        )(
          //
          IF(rnd())(setPixel(i, j, RGB_ALIVE))(setPixel(i, j, RGB_DEAD)),
        ),
      ),
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

  const step = func({}, (result, { width, height, i, j, count, pixel }) => {
    result(
      //
      FOR(
        j(0),
        lt(j, height),
        j(add(j,1)),
      )(
        FOR(
          //
          i(0),
          lt(i, width),
          i(add(i,1)),
        )(
          fadePixel(i, j),
          count(countNeighbors(i, j)),
          pixel(getPixel(i, j)),

          IF(lt(count, 2))(pixel(RGB_DEAD))(),
          IF(gt(count, 3))(pixel(RGB_DEAD))(),
          IF(eq(count, 3))(pixel(RGB_ALIVE))(),

          setPixel(i, j, pixel),
        ),
      ),
    );
  });

  const fill = func(
    { params: { x: i32, y: i32 } },
    (result, { x, y, width, height, top, right, bottom, left, i, j }) => {
      result(
        //
        top(mul(div(y, 4), 3)),
        right(add(x, div(sub(width, x), 4))),
        bottom(add(y, div(sub(height, y), 4))),
        left(mul(div(x, 4), 3)),
        FOR(
          //
          i(left),
          lt(i, right),
          i(add(i,1)),
        )(setPixel(i, top, RGB_ALIVE)),
        FOR(
          //
          i(left),
          lt(i, right),
          i(add(i,1)),
        )(setPixel(i, bottom, RGB_ALIVE)),
        FOR(
          //
          j(top),
          lt(j, bottom),
          j(add(j,1)),
        )(setPixel(left, j, RGB_ALIVE)),
        FOR(
          //
          j(top),
          lt(j, bottom),
          j(add(j,1)),
        )(setPixel(right, j, RGB_ALIVE)),
      );
    },
  );

  return {
    init,
    fill,
    step,
  };
};
