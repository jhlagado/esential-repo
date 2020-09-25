import { esential } from 'esential';
import { addLib } from './add-lib';

const { lib, load, compile } = esential();
lib(addLib);
const exported = load(compile());

it('should add 2 number', () => {
  expect(exported.addition(41, 1)).toBe(42);
});

it('should increment by 1', () => {
  expect(exported.increment(41)).toBe(42);
});
