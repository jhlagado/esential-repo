import { esential } from '@jhlagado/esential';
import { tupleLib } from './tuple-lib';

const { lib, load, compile } = esential();
lib(tupleLib);
const exported = load(compile());

it('should select the second tuple item', () => {
  expect(exported.selectRight()).toBe(2);
});
it('should add 2 tuple numbers', () => {
  expect(exported.addTwo()).toBe(3);
});
it('should add 2 tuple numbers and a passed in number', () => {
  expect(exported.addThree(10)).toBe(13);
});
