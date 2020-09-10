import { esential } from '../esential';
import { ioLib } from './io-lib';

global.console = { ...global.console, log: jest.fn() };

const { lib, literal, start } = esential();

lib(({ func }) => {
  const { log } = lib(ioLib);

  const print3Times = func({}, ({ result }) => {
    result(log(literal(1)), log(literal(2)), log(literal(3)));
  });

  return {
    print3Times,
  };
});

const exported = start();

it('should log 3 times', () => {
  exported.print3Times();
  expect(console.log).toBeCalledTimes(3);
});
