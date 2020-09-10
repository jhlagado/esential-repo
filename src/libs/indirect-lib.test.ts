import { esential } from '../esential';
import { indirectLib } from './indirect-lib';

const { lib, start } = esential();
lib(indirectLib);
const exported = start();

it('should add 2 numbers indirectly', () => {
  expect(exported.indirect123(300, 200)).toBe(500);
});
