import { i32 } from 'binaryen';
import { FOR, IF, LibFunc, ops } from '../../../esential/src';
import { i32Size, pStackStart, rStackStart } from '../common/constants';

export const mainLib: LibFunc = ({ external, func, globals }) => {
  //
  const {
    i32: { lt, add, sub, load, store },
  } = ops;

  globals(
    { psp: i32, rsp: i32 },
    {
      psp: pStackStart,
      rsp: rStackStart,
    },
  );

  const log = external({
    namespace: 'env',
    name: 'log',
    params: { a: i32 },
  });

  const push = func(
    { params: { value: i32 } }, //
    (result, { value, psp }) => {
      result(
        //
        store(0, 0, psp, value),
        psp(add(psp, i32Size)),
      );
    },
  );

  const pop = func(
    { params: {} }, //
    (result, { psp }) => {
      result(
        //
        psp(sub(psp, i32Size)),
        load(0, 0, psp),
      );
    },
  );

  const rnd = external({
    namespace: 'env',
    name: 'rnd',
    params: {},
    result: i32,
  });

  const randomize = func({}, (result, { i, temp }) => {
    result(
      //
      FOR(
        //
        i(0),
        lt(i, 500),
        i(add(i, 1)),
      )(
        //
        IF(rnd())(push(1))(push(0)),
        1000,
      ),
    );
  });

  const init = func(
    { params: { w: i32, h: i32 } }, //
    (result, { w, h }) => {
      result(
        //
        randomize(),
        push(3339),
        pop(),
      );
    },
  );

  return {
    init,
  };
};
