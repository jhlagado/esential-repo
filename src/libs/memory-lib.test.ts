import { asPages, esential } from '../esential';
import { memoryLib } from './memory-lib';

const { lib, load, compile, module: m } = esential();

lib(memoryLib);
console.log('raw:', m.emitText());
const pages = asPages(500000);
const exported = load(compile({ memory: { initial: pages, maximum: pages } }), {
  env: {
    memory: new WebAssembly.Memory({ initial: pages, maximum: pages }),
  },
});

it('should store a number and return it', () => {
  expect(exported.storeAndLoad(346)).toBe(346);
});
