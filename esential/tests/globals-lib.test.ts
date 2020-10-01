import { esential } from '../src';
import { globalsLib } from './globals-lib';

global.console = { ...console, log: jest.fn(console.log) };

const { lib, load, compile, module } = esential();
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
