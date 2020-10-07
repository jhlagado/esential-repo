import { LibFunc, i32ops } from '../../../esential/src';
import { systemLib } from './system';
import { stackLib } from './stack';

export const forthCoreLib: LibFunc = ({ lib, indirect }) => {
  //
  const { push, pop, peek, fpush } = lib(stackLib);
  const { sqrt } = lib(systemLib);
  const { add, mul } = i32ops;

  const dup = indirect(
    { params: {} }, //
    (result, { a }) => {
      result(
        //
        a(peek()),
        push(a),
      );
    },
  );

  const swap = indirect(
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

  const plus = indirect(
    { params: {} }, //
    (result, {}) => {
      result(
        //
        push(add(pop(), pop())),
      );
    },
  );

  const star = indirect(
    { params: {} }, //
    (result, {}) => {
      result(
        //
        push(mul(pop(), pop())),
      );
    },
  );

  const sqroot = indirect(
    { params: {} }, //
    (result, {}) => {
      result(
        //
        fpush(sqrt(pop())),
        // fpush(3),
      );
    },
  );

  return { dup, swap, plus, star, sqroot };
};
