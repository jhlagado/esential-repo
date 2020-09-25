import { esential } from 'esential';
import { resultLib } from './result-lib';

const { lib, load, compile } = esential();
lib(resultLib);
const exported = load(compile());

it('should return a number', () => {
  expect(exported.return1000()).toBe(1000);
});

it('should return another number', () => {
  expect(exported.return2000()).toBe(2000);
});
