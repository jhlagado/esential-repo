import { f32, i32 } from 'binaryen';
import { LibFunc, i32ops, f32ops } from '../../../esential/src';
import { f32Size, i32Size, pStackStart, rStackStart } from '../common/constants';

export const mainLib: LibFunc = ({ external, func, globals }) => {
  //

  const log = external({
    namespace: 'env',
    name: 'log',
    params: { a: i32 },
  });

  const _sqrt = external({
    namespace: 'env',
    name: 'sqrt',
    params: { a: i32 },
    result: f32,
  });

  const { add, sub, mul, load, store } = i32ops;
  const { load: fload, store: fstore } = f32ops;

  globals(
    { psp: i32, rsp: i32 },
    {
      psp: pStackStart,
      rsp: rStackStart,
    },
  );

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

  const peek = func(
    { params: {} }, //
    (result, { psp }) => {
      result(
        //
        load(0, 0, sub(psp, i32Size)),
      );
    },
  );

  const dup = func(
    { params: {} }, //
    (result, { a }) => {
      result(
        //
        a(peek()),
        push(a),
      );
    },
  );

  const swap = func(
    { params: {} }, //
    (result, { a, b }) => {
      result(
        //
        a(pop()),
        b(pop()),
        push(a),
        push(b),
      );
    },
  );

  const fpush = func(
    { params: { value: f32 } }, //
    (result, { value, psp }) => {
      result(
        //
        fstore(0, 0, psp, value),
        psp(add(psp, f32Size)),
      );
    },
  );

  const fpop = func(
    { params: {}, result: f32 }, //
    (result, { psp }) => {
      result(
        //
        psp(sub(psp, f32Size)),
        fload(0, 0, psp),
      );
    },
  );

  const plus = func(
    { params: {} }, //
    (result, {}) => {
      result(
        //
        push(add(pop(), pop())),
      );
    },
  );

  const star = func(
    { params: {} }, //
    (result, {}) => {
      result(
        //
        push(mul(pop(), pop())),
      );
    },
  );

  const sqrt = func(
    { params: {} }, //
    (result, {}) => {
      result(
        //
        fpush(_sqrt(pop())),
        // fpush(3),
      );
    },
  );

  const hyp = func(
    { params: {} }, //
    (result, {}) => {
      result(
        //
        dup(),
        star(),
        swap(),
        dup(),
        star(),
        plus(),
      );
    },
  );

  const init = func(
    { params: { w: i32, h: i32 } }, //
    (result, { w, h }) => {
      result(
        //
        push(w),
        push(h), 
        dup(),
        star(),
        swap(),
        dup(),
        star(),
        plus(),
        sqrt(),
        fpop(), 
      );
    },
  );

  return {
    init,
  };
};
