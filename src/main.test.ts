import { Mod } from './modules';
import { addLib } from './libs/add-lib';
import { tupleLib } from './libs/tuple-lib';
import { recordLib } from './libs/record-lib';
import { ioLib } from './libs/io-lib';

const { lib, emitText, compile } = Mod();
lib(ioLib);
lib(addLib);
lib(tupleLib);
lib(recordLib);

console.log('---------------------------------------');
console.log('Raw:', emitText());
const exported = compile();
console.log('Optimized:', emitText());

it('should add 2 number', () => {
  expect(exported.addition(41, 1)).toBe(42);
});
it('should select the second tuple item', () => {
  expect(exported.selectRight()).toBe(2);
});
it('should add 2 tuple numbers', () => {
  expect(exported.addTwo()).toBe(3);
});
it('should add 2 tuple numbers and a passed in number', () => {
  expect(exported.addThree(10)).toBe(13);
});
it('should select the second record item', () => {
  expect(exported.selectRightRecord()).toBe(2);
});
it('should add 2 record numbers', () => {
  expect(exported.addTwoRecord()).toBe(3);
});
it('should add 2 record numbers and a passed in number', () => {
  expect(exported.addThreeRecord(10)).toBe(13);
});
