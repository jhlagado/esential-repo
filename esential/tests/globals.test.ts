import { i32 } from 'binaryen';
import { esential, LibFunc, i32ops } from '../src';

export const globalsLib: LibFunc = ({ func, globals }) => {
  //
  const { add } = i32ops;

  globals({ g1: i32, g2: [i32, i32] }, { g1: 999, g2: [1000, 2000] });

  const global1000 = func({}, (result, { u, g1 }) => {
    result(u(add(g1, 1)), u());
  });

  const global2000 = func({}, (result, { g2 }) => {
    result(g2[1]);
  });

  return {
    global1000,
    global2000,
  };
};

global.console = { ...console, log: jest.fn(console.log) };

const { lib, load, compile } = esential();
lib(globalsLib);
const exported = load(compile());

it('should return a global with the value of 1000', () => {
  const j = exported.global1000();
  expect(j).toBe(1000);
});

it('should index into a tuple and return 2000', () => {
  const j = exported.global2000();
  expect(j).toBe(2000);
});
