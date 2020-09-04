import { Mod } from './modules';
import { mainLib } from './demo-libs';

const mod = Mod({});
mod.lib(mainLib);

console.log('Raw:', mod.emitText());
const exported = mod.compile();

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
