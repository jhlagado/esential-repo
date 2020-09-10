import { i32 } from 'binaryen';
import { Mod } from './modules';
import { ops } from './core';
import { builtin } from './typedefs';

const { lib, emitText, start } = Mod();
const add = builtin(ops.i32.add, i32);

lib(({ func }) => {
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
