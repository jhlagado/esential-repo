import { Mod } from '../modules';
import { memoryLib } from './memory-lib';

const { lib, compile } = Mod();
lib(memoryLib);
const exported = compile();

it('should add 2 numbers indirectly', () => {
  expect(exported.mem256()).toBe(346);
});
