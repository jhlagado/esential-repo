import { i32 } from 'binaryen';
import { esential, builtin } from '../src/esential';

const { lib, module, load, compile } = esential();

lib(({ func }) => {
  const add = builtin(module.i32.add, i32);

  const addition = func(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      result(
        $({
          u: add($.a, $.b),
        }),
        $.u,
      );
    },
  );
  return {
    addition,
  };
});

const exported = load(compile());
console.log(module.emitText());
console.log(exported.addition(41, 1));
