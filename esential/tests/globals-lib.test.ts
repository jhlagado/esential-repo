import { esential } from 'esential/src';
import { globalsLib } from './globals-lib';

global.console = { ...console, log: jest.fn(console.log) };

const { lib, load, compile, module } = esential();
lib(globalsLib);
console.log('raw:', module.emitText());
const exported = load(compile());

it('should return a global with the value of 1000', () => {
  const j = exported.global1000();
  expect(j).toBe(1000);
});
