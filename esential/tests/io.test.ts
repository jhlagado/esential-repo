import { esential } from '../src';
import { ioLib } from './shared';

global.console = { ...global.console, log: jest.fn() };

const { lib, load, compile } = esential();

lib(({ func }) => {
  const { log } = lib(ioLib);

  const print3Times = func({}, result => {
    result(
      //
      log(1),
      log(2),
      log(3),
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
  (console.log as any).mockClear();
  exported.print3Times();
  expect(console.log).toBeCalledTimes(3);
});
