import { esential } from 'esential/src';

const { lib, load, compile } = esential();

lib(({ func, ops, FOR, IF }) => {
  
  const { add, lt, eqz, rem } = ops.i32;

  const main = func({}, (result, { odd, even, i }) => {
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
    main,
  };
});

const exported = load(compile());
console.log(exported.main());
