import { Mod } from '../modules';
import { memoryLib } from './memory-lib';

const { lib, compile } = Mod();
lib(memoryLib);
const exported = compile();

it('should store a number and return it', () => {
  expect(exported.storeAndLoad(346)).toBe(346);
});
