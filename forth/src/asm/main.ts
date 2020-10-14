import { i32, none } from 'binaryen';
import { LibFunc, i32ops, Callable, getModule, setTypeDef, block } from '../../../esential/src';

import { callableInfoMap } from '../../../esential/src/maps';
import { RGB_ALIVE } from '../common/constants';
import { compileLib } from './compile';
import { forthCoreLib } from './forth-core';
import { stackLib } from './stack';
import { systemLib } from './system';
const { add, mul, store } = i32ops;

export const mainLib: LibFunc = ({ lib, func, }) => {
  //
  const { log } = lib(systemLib);
  const { COMPILE, doColon } = lib(compileLib);
  const { push, pop, popf, rpush } = lib(stackLib);
  const { lit, dup, swap, plus, star, sqroot } = lib(forthCoreLib);

  const DEFWORD = (...indirects: Callable[]) =>
    func({ params: {} }, (result, {}) => {
      const module = getModule();
      const opcodes = indirects
        .map(indirect => callableInfoMap.get(indirect))
        .map(info => {
          const index = info?.index || 0;
          const expr = module.call_indirect(module.i32.const(index), [], none, none);
          setTypeDef(expr, none);
          return expr;
        });
      result(block(...opcodes));
    });

  const hyp1 = DEFWORD(dup, star, swap, dup, star, plus, sqroot);

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

  const setPixel = func({ params: { x: i32, y: i32, v: i32 } }, (result, { offset, x, y, v }) => {
    result(
      //
      store(0, 0, getPos(x, y, offset), v),
    );
  });

  const init = func(
    { params: { w: i32, h: i32 } }, //
    (result, { width, height, offset, w, h, MYWORD, DUP, LIT }) => {
      result(
        //
        width(w),
        height(h),
        offset(mul(w, h)),
        setPixel(10, 10, RGB_ALIVE),

        push(w),
        push(h),
        hyp1(),
        popf(),

        DUP(COMPILE(dup)),
        LIT(COMPILE(lit)),
        MYWORD(COMPILE(doColon, LIT, 100, DUP)),
        log(pop()),
        log(pop()),
        rpush(-1),
        // forth(MYWORD),
        1000,
      );
    },
  );

  const step = func(
    { params: {} }, //
    (result, {}) => {
      result(
        //
        1,
      );
    },
  );

  const fill = func(
    { params: {} }, //
    (result, {}) => {
      result(
        //
        1,
      );
    },
  );

  return {
    init,
    step,
    fill,
  };
};
