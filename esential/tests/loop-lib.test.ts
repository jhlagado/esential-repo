import { esential } from 'esential';
import { loopLib } from './loop-lib';

global.console = { ...console, log: jest.fn(console.log) };

const { lib, load, compile, module: m } = esential();
lib(loopLib);
const exported = load(compile());

it('should count up to 10', () => {
  const j = exported.looper();
  expect(j).toBe(10);
});
