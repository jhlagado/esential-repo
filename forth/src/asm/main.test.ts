import { asPages, esential } from '../../../esential/src';
import { mainLib } from './main';

global.console = { ...console, log: jest.fn(console.log) };

const pages = asPages(500000);
const size = { initial: pages, maximum: pages };
const memory = new WebAssembly.Memory(size);

const { lib, load, compile } = esential({ memory: { ...size } });

lib(mainLib);
const exported = load(compile(), {
  env: {
    memory,
    abort: function() {
      return;
    },
    log: (number: number) => {
      let hex = number;
      if (hex < 0) hex = 0xffffffff + hex + 1;

      console.log(hex.toString(16), `(${number})`);
      return;
    },
    rnd: () => {
      return Math.random() < 0.2;
    },
  },
});

it('should init lib', () => {
  const j = exported.init(100, 100);
  expect(j).toBe(3339);
});
