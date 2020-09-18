import { esential } from 'esential/src';
import { loopLib } from './loop-lib';

global.console = { ...console, log: jest.fn(console.log) };

const { lib, load, compile, module: m } = esential();
lib(loopLib);
console.log('raw:', m.emitText());
const exported = load(compile());

it('should count up to 10', () => {
  const j = exported.looper();
  expect(j).toBe(10);
});
