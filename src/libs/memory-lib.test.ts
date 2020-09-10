import { Mod } from '../modules';
import { memoryLib } from './memory-lib';

const { lib, run } = Mod();
lib(memoryLib);
const exported = run();

it('should store a number and return it', () => {
  expect(exported.storeAndLoad(346)).toBe(346);
});
