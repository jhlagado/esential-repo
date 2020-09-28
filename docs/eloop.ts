import { i32 } from 'binaryen';
import { esential } from '@jhlagado/esential';

const { lib, load, compile } = esential();

lib(({ func, block, FOR, i32: { add, sub, gt } }) => {
  //
  const main = func({ params: { a: i32, b: i32 } }, (result, { i, j }) => {
    result(
      FOR(
        block(
          //
          i(10),
          j(0),
        ),
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
