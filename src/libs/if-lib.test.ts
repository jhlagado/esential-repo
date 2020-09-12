import { esential } from '../esential';
import { ifLib } from './if-lib';

global.console = { ...console, log: jest.fn(console.log) };

const { lib, start, module: m } = esential();
lib(ifLib);
console.log('raw:', m.emitText());
const exported = start();

it('should return the number of odds when counting to 10', () => {
  const j = exported.oddeven();
  expect(j).toBe(5);
});
