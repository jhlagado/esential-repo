import { esential } from '../esential';
import { loopLib } from './loop-lib';

global.console = { ...console, log: jest.fn(console.log) };

const { lib, start } = esential();
lib(loopLib);
const exported = start();

it('should loop', () => {
  exported.looper()
  expect(console.log).toBeCalledTimes(1);
});
