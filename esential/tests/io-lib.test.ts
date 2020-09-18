import { esential } from 'esential/src';
import { ioLib } from './io-lib';

global.console = { ...global.console, log: jest.fn() };

const { lib, load, compile } = esential();

lib(({ func, literal }) => {
  const { log } = lib(ioLib);

  const print3Times = func({}, ({ result }) => {
    result(
      //
      log(literal(1)),
      log(literal(2)),
      log(literal(3)),
    );
  });

  return {
    print3Times,
  };
});

const exported = load(compile(), {
  env: {
    log: (a: number) => {
      console.log(a);
      return;
    },
  },
});

it('should log 3 times', () => {
  exported.print3Times();
  expect(console.log).toBeCalledTimes(3);
});
