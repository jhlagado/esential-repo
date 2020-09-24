import { i32 } from 'binaryen';
import { esential } from 'esential/src';

const { lib, load, compile } = esential();

lib(({ func, builtin }) => {
  const {
    i32: { add },
  } = builtin;

  const addition = func({ params: { a: i32, b: i32 } }, (result, { a, b, u }) => {
    result(
      //
      u(add(a, b)),
      u,
    );
  });
  return {
    addition,
  };
});

const exported = load(compile());
console.log(exported.addition(41, 1));
