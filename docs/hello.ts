import { i32 } from 'binaryen';
import { esential } from 'esential';

const { lib, load, compile } = esential();

lib(({ func, i32: { add } }) => {
  //
  const main = func({ params: { a: i32, b: i32 } }, (result, { a, b, u }) => {
    result(
      //
      u(add(a, b)),
      u,
    );
  });
  return {
    main,
  };
});

const exported = load(compile());
console.log(exported.main(41, 1));
