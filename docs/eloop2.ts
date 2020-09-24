import { esential } from 'esential/src';

const { lib, load, compile } = esential();

lib(({ func, builtin, FOR, IF }) => {

  const {
    i32: { add, lt, eqz, rem },
  } = builtin;

  const eloop2 = func({}, (result, { odd, even, i }) => {
    result(
      odd(0),
      even(0),
      FOR(
        i(0),
        lt(i, 10),
        i(add(i, 1)),
      )(
        //
        IF(eqz(rem(i, 2)))(
          //
          even(add(even, 1)),
        )(
          //
          odd(add(odd, 1)),
        ),
      ),
      odd,
    );
  });

  return {
    eloop2,
  };
});

const exported = load(compile());
console.log(exported.eloop2());
