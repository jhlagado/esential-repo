import { Mod } from '../modules';
import { addLib } from './add-lib';

const { lib, run } = Mod();
lib(addLib);
const exported = run();

it('should add 2 number', () => {
  expect(exported.addition(41, 1)).toBe(42);
});

