import { esential } from 'esential';
import { ifLib } from './if-lib';

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

it('should return the number of odds when counting to 10', () => {
  const j = exported.oddeven();
  expect(j).toBe(5);
});
