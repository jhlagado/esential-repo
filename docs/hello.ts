import { i32 } from 'binaryen';
import { builtin, esential } from 'esential/src';

const { lib, module, load, compile } = esential();

lib(({ func }) => {
  const add = builtin(module, module.i32.add, { a: i32, b: i32 }, i32);

  const addition = func({ params: { a: i32, b: i32 } }, ({ vars: { a, b, u }, result }) => {
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
