import { i32, none } from 'binaryen';
import { ops } from '../core';
import { ModDef } from '../types';
import { builtin, literal } from '../utils';
import { ioLib } from './io-lib';

const {
  i32: { add },
} = ops;

const add1 = builtin(add, i32);

export const addLib = ({ lib, func, indirect, getModule }: ModDef) => {
  const { log } = lib(ioLib);

  const addition = func(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      $.u = add1($.a, $.b);
      result($.u);
    },
  );

  const indirectAddition = indirect(
    {},

    ({ $, result }) => {
      result(add1(literal(200), literal(200)));
    },
  );

  const testIndirectAddition = func(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      const module = getModule();
      result(
        log(module.call_indirect(literal(0), [], none, i32)),
        literal(10000),
      );
    },
  );

  return {
    addition,
    indirectAddition,
    testIndirectAddition,
  };
};
