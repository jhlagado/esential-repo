import { i32 } from 'binaryen';
import { block, esential, FOR, IF, LibFunc, ops } from '../src';
import { ioLib } from './shared';

export const ifLib: LibFunc = ({ lib, func }) => {
  //
  const {
    i32: { add, sub, lt, rem, eqz },
  } = ops;

  const { log } = lib(ioLib);

  const isEven = func({ params: { number: i32 }, result: i32 }, (result, { number }) => {
    result(IF(eqz(rem(number, 2)))(1)(0));
  });

  const oddeven = func({}, (result, { odd, even, i }) => {
    result(
      FOR(
        block(
          //
          odd(0),
          even(0),
          i(0),
        ),
        lt(i, 10),
        i(add(i, 1)),
      )(
        //
        IF(eqz(rem(i, 2)))(
          //
          even(add(even, 1)),
        )(
          //
          odd(add(odd, 1)),
          log(odd),
        ),
      ),
      odd,
    );
  });

  const getM1 = func(
    { params: { x: i32, limit: i32 } }, //
    (result, { limit, x }) => {
      result(
        //
        sub(IF(eqz(x))(limit)(x), 1),
      );
    },
  );

  return {
    isEven,
    oddeven,
    getM1,
  };
};

global.console = { ...console, log: jest.fn(console.log) };

const { lib, load, compile } = esential();
lib(ifLib);
const exported = load(compile(), {
  env: {
    log: (a: number) => {
      console.log(a);
      return;
    },
  },
});

it('should return 1 if number is even', () => {
  const j = exported.isEven(4);
  expect(j).toBe(1);
});
it('should return 0 if number is odd', () => {
  const j = exported.isEven(5);
  expect(j).toBe(0);
});
it('should return the number of odds when counting to 10', () => {
  const j = exported.oddeven();
  expect(j).toBe(5);
});
it('should sub 1', () => {
  const j = exported.getM1(1, 10);
  expect(j).toBe(0);
});

it('should sub 1 and wrap if below zero', () => {
  const j = exported.getM1(0, 10);
  expect(j).toBe(9);
});
