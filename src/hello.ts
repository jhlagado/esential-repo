import { i32 } from 'binaryen';
import { Esential } from './modules';
import { builtin } from './typedefs';

const { lib, emitText, start } = Esential();

lib(({ func, module }) => {
  const add = builtin(module.i32.add, i32);

  const addition = func(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      $.u = add($.a, $.b);
      result($.u);
    },
  );
  return {
    addition,
  };
});

const exported = start();
console.log(emitText());
console.log(exported.addition(41, 1));
