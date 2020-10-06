import { asPages, esential, getModule } from '../../../esential/src';
import { mainLib } from './main';

const module = getModule();

global.console = { ...console, log: jest.fn(console.log) };

const stringSegment = (string: string) => new TextEncoder().encode(string);

const uint32ArraySegment = (array: number[]) => new Uint8Array(new Uint32Array(array).buffer);

const getSegments = (arrays: Uint8Array[]) => {
  let offset = 0;
  const segments = [];
  for (const array of arrays) {
    segments.push({
      offset: module.i32.const(offset),
      data: array,
    });
    offset += array.length;
  }
  return segments;
};

const pages = asPages(500000);
const memoryDef = {
  initial: pages,
  maximum: pages,
  name: 'memory1',
  segments: getSegments([
    //
    stringSegment('xyz'),
    uint32ArraySegment([1000, 2000, 3000]),
  ]),
};
const memory = new WebAssembly.Memory(memoryDef);
const tableDef = { initial: 10, maximum: 100 };

const { lib, load, compile } = esential({ memory: memoryDef, table: tableDef });

lib(mainLib);
const exported = load(compile({ debugOptimized: true }), {
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
  },
  Math,
});

it('should init lib', () => {
  const j = exported.init(3, 4);
  expect(j).toBe(5);
});
