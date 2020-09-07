import { Mod } from '../modules';
import { addLib } from './add-lib';

const { lib, compile } = Mod();
lib(addLib);
const exported = compile();

it('should add 2 number', () => {
  expect(exported.addition(41, 1)).toBe(42);
});
