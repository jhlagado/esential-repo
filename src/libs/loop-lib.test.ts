import { esential } from '../esential';
import { loopLib } from './loop-lib';

global.console = { ...console, log: jest.fn(console.log) };

const { lib, start, module: m } = esential();
lib(loopLib);
console.log('raw:', m.emitText());
const exported = start();

it('should loop', () => {
  const j = exported.looper();
  expect(j).toBe(10);
});
