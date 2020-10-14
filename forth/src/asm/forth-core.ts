import { LibFunc, i32ops, IF } from '../../../esential/src';
import { systemLib } from './system';
import { stackLib } from './stack';
import { i32Size } from '../common/constants';
import { i32 } from 'binaryen';

const { add, mul, load, eq } = i32ops;

export const forthCoreLib: LibFunc = ({ lib, func, indirect }) => {
  //
  const { push, pop, peek, pushf, rpush, rpop } = lib(stackLib);
  const { sqrt } = lib(systemLib);

  const forth = func(
    { params: { start: i32 } }, //
    (result, { start, IP, pfa, index, f }) => {
      result(
        //
        IP(start),
        pfa(rpop()),
        // IF(eq(pfa, -1))(0)(
          //
          index(load(0, 0, IP)),
          f(pfa),
        // ),
      );
    },
  );

  const lit = indirect(
    { params: {} }, //
    (result, { ptr, a }) => {
      result(
        //
        ptr(rpop()),
        a(load(0, 0, ptr)),
        push(a),
        rpush(add(ptr, i32Size)),
      );
    },
  );

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
        pushf(sqrt(pop())),
        // fpush(3),
      );
    },
  );

  return { forth, lit, dup, swap, plus, star, sqroot };
};
