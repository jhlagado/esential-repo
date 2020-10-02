import { i32 } from 'binaryen';
import { esential, LibFunc } from '../src';

export const indirectLib: LibFunc = ({ func, i32: { add } }) => {
  //
  const indirectAddition = func(
    { params: { a: i32, b: i32 }, indirect: true },

    (result, { a, b }) => {
      result(add(a, b));
    },
  );

  const indirect123 = func(
    { params: { a: i32, b: i32 }, result: i32 },

    (result, { a, b }) => {
      result(indirectAddition(a, b));
    },
  );

  return {
    indirectAddition,
    indirect123,
  };
};

const size = { initial: 10, maximum: 100 };
const instance = new WebAssembly.Table({ ...size, element: 'anyfunc' });

const { lib, load, compile, module } = esential({ table: { ...size, instance } });
lib(indirectLib);

const exported = load(compile());

it('should add 2 numbers indirectly', () => {
  expect(exported.indirect123(300, 200)).toBe(500);
});
