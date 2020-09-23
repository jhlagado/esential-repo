import { esential } from 'esential/src';
import { resultLib } from './result-lib';

const { lib, load, compile } = esential();
lib(resultLib);
const exported = load(compile());

it('should return a number', () => {
  expect(exported.return1000()).toBe(1000);
});
