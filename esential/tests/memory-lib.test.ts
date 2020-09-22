import { asPages, esential } from 'esential/src';
import { memoryLib } from './memory-lib';

const pages = asPages(500000);
const size = { initial: pages, maximum: pages };
const instance = new WebAssembly.Memory(size);

const { lib, load, compile, module } = esential({ memory: { ...size, instance } });

lib(memoryLib);

console.log('raw:', module.emitText());
const exported = load(compile());

it('should store a number and return it', () => {
  expect(exported.storeAndLoad(346)).toBe(346);
});
