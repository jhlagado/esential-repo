import { Mod } from '../modules';
import { recordLib } from './record-lib';

const { lib, run } = Mod();
lib(recordLib);
const exported = run();

it('should select the second record item', () => {
  expect(exported.selectRightRecord()).toBe(2);
});
it('should add 2 record numbers', () => {
  expect(exported.addTwoRecord()).toBe(3);
});
it('should add 2 record numbers and a passed in number', () => {
  expect(exported.addThreeRecord(10)).toBe(13);
});
