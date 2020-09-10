import { esential } from '../esential';
import { memoryLib } from './memory-lib';

const { lib, start } = esential();
lib(memoryLib);
const exported = start();

it('should store a number and return it', () => {
  expect(exported.storeAndLoad(346)).toBe(346);
});
