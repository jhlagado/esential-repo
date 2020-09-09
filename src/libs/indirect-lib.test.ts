import { Mod } from '../modules';
import { indirectLib } from './indirect-lib';

const { lib, compile } = Mod();
lib(indirectLib);
const exported = compile();

it('should add 2 numbers indirectly', () => {
  expect(exported.indirect123(300, 200)).toBe(500);
});
