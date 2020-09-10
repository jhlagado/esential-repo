import { esential } from '../esential';
import { recordLib } from './record-lib';

const { lib, start } = esential();
lib(recordLib);
const exported = start();

it('should select the second record item', () => {
  expect(exported.selectRightRecord()).toBe(2);
});
it('should add 2 record numbers', () => {
  expect(exported.addTwoRecord()).toBe(3);
});
it('should add 2 record numbers and a passed in number', () => {
  expect(exported.addThreeRecord(10)).toBe(13);
});
