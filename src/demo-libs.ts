/* eslint-disable no-empty-pattern */
import { i32 } from 'binaryen';
import { ops } from './core';
import { ModDef } from './types';
import { literal } from './utils';

const {
  i32: { add },
} = ops;

export const addLib = ({ func }: ModDef) => {
  const addition = func(
    { arg: { a: i32, b: i32 }, result: i32, locals: { u: i32 } },

    ($, result) => {
      $.u = add($.a, $.b);
      result($.u);
    },
  );
  return {
    addition,
  };
};

export const tupleLib = ({ lib, func }: ModDef) => {
  const { addition } = lib(addLib);

  const returnTwo = func(
    { result: [i32, i32], locals: { u: [i32, i32] }, export: false },
    ($, result) => {
      $.u = [literal(1), literal(2)];
      result($.u);
    },
  );

  const selectRight = func({ result: i32, locals: { u: [i32, i32] } }, ($, result) => {
    $.u = returnTwo();
    result($.u[1]);
  });

  const addTwo = func({ result: i32, locals: { u: [i32, i32] } }, ($, result) => {
    $.u = returnTwo();
    result(addition($.u[0], $.u[1]));
  });

  const addThree = func(
    { arg: { a: i32 }, result: i32, locals: { u: [i32, i32] } },
    ($, result) => {
      $.u = returnTwo();
      result(addition($.a, addition($.u[0], $.u[1])));
    },
  );

  return {
    selectRight,
    addTwo,
    addThree,
  };
};

export const recordLib = ({ lib, func }: ModDef) => {
  const { addition } = lib(addLib);

  const returnTwoRecord = func(
    { result: { x: i32, y: i32 }, locals: { u: { x: i32, y: i32 } }, export: false },
    ($, result) => {
      $.u = { x: literal(1), y: literal(2) };
      result($.u);
    },
  );

  const selectRightRecord = func(
    { result: i32, locals: { u: { x: i32, y: i32 } } },
    ($, result) => {
      $.u = returnTwoRecord();
      result($.u.y);
    },
  );

  const addTwoRecord = func(
    { result: i32, locals: { u: { x: i32, y: i32 } } },
    ($, result) => {
      $.u = returnTwoRecord();
      result(addition($.u.x, $.u.y));
    },
  );

  const addThreeRecord = func(
    { arg: { a: i32 }, result: i32, locals: { u: { x: i32, y: i32 } } },
    ($, result) => {
      $.u = returnTwoRecord();
      result(addition($.a, addition($.u.x, $.u.y)));
    },
  );

  return {
    selectRightRecord,
    addTwoRecord,
    addThreeRecord,
  };
};

export const mainLib = ({ lib }: ModDef) => {
  const { addition } = lib(addLib);
  const { selectRight, addTwo, addThree } = lib(tupleLib);
  const { selectRightRecord, addTwoRecord, addThreeRecord } = lib(recordLib);

  return {
    addition,
    selectRight,
    addTwo,
    addThree,
    selectRightRecord,
    addTwoRecord,
    addThreeRecord,
  };
};
