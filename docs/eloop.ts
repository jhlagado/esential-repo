import { i32 } from 'binaryen';
import { esential } from 'esential/src';

const { lib, load, compile } = esential();

lib(({ func, builtin, FOR }) => {
  const {
    i32: { add, sub, gt },
  } = builtin;

  const eloop = func({ params: { a: i32, b: i32 } }, (result, { i, j }) => {
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
    eloop,
  };
});

const exported = load(compile());
console.log(exported.eloop());
