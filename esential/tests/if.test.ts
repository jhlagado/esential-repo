import { esential, LibFunc } from '../src';
import { ioLib } from './shared';

export const ifLib: LibFunc = ({ lib, func, block, FOR, IF, i32: { add, lt, rem, eqz } }) => {
  //
  const { log } = lib(ioLib);

  // const isOdd = func({ params: { a: i32 } }, (result, { a }) => {
  //   result(IFF(eqz(rem(a, 2)))(100)(200));
  // });

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

  return {
    // isOdd,
    oddeven,
  };
};

global.console = { ...console, log: jest.fn(console.log) };

const { lib, load, compile, module: m } = esential();
lib(ifLib);
const exported = load(compile(), {
  env: {
    log: (a: number) => {
      console.log(a);
      return;
    },
  },
});

// it('should return 100 if number is odd', () => {
//   const j = exported.isOdd(5);
//   expect(j).toBe(100);
// });
it('should return the number of odds when counting to 10', () => {
  const j = exported.oddeven();
  expect(j).toBe(5);
});
