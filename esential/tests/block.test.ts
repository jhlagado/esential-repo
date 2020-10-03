import { i32 } from 'binaryen';
import { esential, LibFunc, ops } from '../src';

export const blockLib: LibFunc = ({ func }) => {
  //
  const {
    i32: { add },
  } = ops;

  const blockadd = func({ locals: { a: i32, b: i32 } }, (result, { a, b, u }) => {
    result(
      //
      a(1),
      b(2),
      u(add(a, b)),
      u,
    );
  });

  return {
    blockadd,
  };
};

const { lib, load, compile } = esential();
lib(blockLib);
const exported = load(compile());

it('should add numbers defined within block', () => {
  expect(exported.blockadd()).toBe(3);
});
