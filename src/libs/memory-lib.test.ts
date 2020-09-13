import { esential } from '../esential';
import { memoryLib } from './memory-lib';

const { lib, start, module: m } = esential();
lib(memoryLib, { width: 600, height: 600 });
console.log('raw:', m.emitText());
const exported = start();

it('should store a number and return it', () => {
  expect(exported.storeAndLoad(346)).toBe(346);
});
