import { esential } from 'esential/src';
import { blockLib } from './block-lib';

const { lib, load, compile } = esential();
lib(blockLib);
const exported = load(compile());

it('should add numbers defined within block', () => {
  expect(exported.blockadd()).toBe(3);
});
