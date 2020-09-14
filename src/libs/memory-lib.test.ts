import { asPages, esential } from '../esential';
import { memoryLib } from './memory-lib';

const { lib, load, compile, module: m } = esential();

const pages = asPages(500000);
lib(memoryLib, { pages });
console.log('raw:', m.emitText());
const exported = load(compile(), {
  env: {
    memory: new WebAssembly.Memory({ initial: pages, maximum: pages }),
  },
});

it('should store a number and return it', () => {
  expect(exported.storeAndLoad(346)).toBe(346);
});
