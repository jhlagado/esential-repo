import { i32, none } from 'binaryen';
import {
  LibFunc,
  i32ops,
  Callable,
  getModule,
  setTypeDef,
  block,
  getIndirectIndex,
} from '../../../esential/src';
import { callableInfoMap } from '../../../esential/src/maps';
import { RGB_ALIVE } from '../common/constants';
import { forthCoreLib } from './forth-core';
import { stackLib } from './stack';
import { systemLib } from './system';

export const mainLib: LibFunc = ({ lib, func, indirect }) => {
  //
  lib(systemLib);
  const { push, fpop } = lib(stackLib);
  const { dup, swap, plus, star, sqroot } = lib(forthCoreLib);
  const { add, mul, store } = i32ops;

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
    (result, { width, height, offset, w, h }) => {
      result(
        //
        width(w),
        height(h),
        offset(mul(w, h)),
        setPixel(10, 10, RGB_ALIVE),

        push(w),
        push(h),
        hyp1(),
        fpop(),
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

  const WRITE = func({ params: { data: i32 } }, (result, { data, HERE }) => {
    result(
      //
      store(0, 0, HERE, data),
      HERE(add(HERE, 1)),
      0,
    );
  });

  const doColon = indirect({}, (result, {}) => {});

  const COMPILE = (...items: (Callable | number)[]) => {
    const data = items.map(item => {
      if (Number.isInteger(item)) {
        return item as number;
      } else {
        const info = callableInfoMap.get(item as Callable);
        if (!info) throw new Error(`item not indirect ${item}`);
        return info.index as number;
      }
    });
    const DOCOLON = getIndirectIndex(doColon);
    return func({ params: {} }, (result, {}) => {
      result(
        //
        WRITE(0), //flags
        WRITE(DOCOLON),
        block(...data.map(item => WRITE(item))),
      );
    });
  };

  return {
    init,
    step,
  };
};
