import { i32 } from 'binaryen';
import { esential } from 'esential';

const { lib, load, compile } = esential();

lib(({ func, i32: { add, sub, gt }, FOR }) => {
  //
  const main = func({ params: { a: i32, b: i32 } }, (result, { i, j }) => {
    result(
      j(0),
      FOR(
        i(10),
        gt(i, 0),
        i(sub(i, 1)),
      )(
        //
        j(add(j, 1)),
      ),
      j,
    );
  });
  return {
    main,
  };
});

const exported = load(compile());
console.log(exported.main());
