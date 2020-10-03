import { block, esential, FOR, LibFunc, i32ops } from '../src';

export const loopLib: LibFunc = ({ func }) => {
  //
  const { add, sub, gt } = i32ops;

  const looper = func({}, (result, { i, j }) => {
    result(
      FOR(
        block(
          //
          j(0),
          i(10),
        ),
        gt(i, 0),
        i(sub(i, 1)),
      )(
        //
        j(add(j, 1)),
      ),
      j,
    );
  });

  return {
    looper,
  };
};

global.console = { ...console, log: jest.fn(console.log) };

const { lib, load, compile } = esential();
lib(loopLib);
const exported = load(compile());

it('should count up to 10', () => {
  const j = exported.looper();
  expect(j).toBe(10);
});
