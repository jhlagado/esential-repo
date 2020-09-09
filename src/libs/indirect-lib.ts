import { i32, none } from 'binaryen';
import { ops } from '../core';
import { ModDef } from '../types';
import { builtin, literal, setTypeDef, asType } from '../utils';
import { ioLib } from './io-lib';

const {
  i32: { add },
} = ops;

const add1 = builtin(add, i32);

export const indirectLib = ({ lib, func, indirect, getModule }: ModDef) => {
  const { log } = lib(ioLib);

  const indirectAddition = indirect(
    {params: { a: i32, b: i32 }},

    ({ $, result }) => {
      result(add1(literal(100), literal(23)));
    },
  );

  const indirect123 = func(
    { params: { a: i32, b: i32 }, result: i32 },

    ({ $, result }) => {
      const module = getModule();
      const expr = module.call_indirect(literal(0), [$.a, $.b], asType([i32, i32]), i32);
      setTypeDef(expr, i32);
      result(expr);
    },
  );

  return {
    indirectAddition,
    indirect123,
  };
};
