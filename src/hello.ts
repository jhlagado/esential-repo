import { i32 } from 'binaryen';
import { Mod } from './modules';
import { ops } from './core';
import { builtin } from './typedefs';
import { ModDef } from './types';

const add = builtin(ops.i32.add, i32);

export const addLib = ({ func }: ModDef) => {

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
};


const { lib, emitText, compile } = Mod();

lib(addLib);

const exported = compile();
console.log(emitText());
console.log(exported.addition(41, 1));
