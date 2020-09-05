/* eslint-disable no-empty-pattern */
import { i32 } from 'binaryen';
import { ops } from './core';
import { ModDef } from './types';
import { _ } from './utils';

const {
  i32: { add },
} = ops;

export const addLib = ({ func }: ModDef) => {
  const addition = func(
    { arg: { a: i32, b: i32 }, ret: i32, locals: { u: i32 } },

    ($, ret) => {
      $.u = add($.a, $.b);
      ret($.u);
    },
  );
  return {
    addition,
  };
};

export const tupleLib = ({ lib, func }: ModDef) => {
  const { addition } = lib(addLib);

  const returnTwo = func(
    { ret: [i32, i32], locals: { u: [i32, i32] }, export: false },
    ($, ret) => {
      $.u = [_(1), _(2)];
      ret($.u);
    },
  );

  const selectRight = func({ ret: i32, locals: { u: [i32, i32] } }, ($, ret) => {
    $.u = returnTwo();
    ret($.u[1]);
  });

  const addTwo = func({ ret: i32, locals: { u: [i32, i32] } }, ($, ret) => {
    $.u = returnTwo();
    ret(addition($.u[0], $.u[1]));
  });

  const addThree = func(
    { arg: { a: i32 }, ret: i32, locals: { u: [i32, i32] } },
    ($, ret) => {
      $.u = returnTwo();
      ret(addition($.a, addition($.u[0], $.u[1])));
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
    { ret: { x: i32, y: i32 }, locals: { u: { x: i32, y: i32 } }, export: false },
    ($, ret) => {
      $.u = { x: _(1), y: _(2) };
      ret($.u);
    },
  );

  const selectRightRecord = func(
    { ret: i32, locals: { u: { x: i32, y: i32 } } },
    ($, ret) => {
      $.u = returnTwoRecord();
      ret($.u.y);
    },
  );

  const addTwoRecord = func(
    { ret: i32, locals: { u: { x: i32, y: i32 } } },
    ($, ret) => {
      $.u = returnTwoRecord();
      ret(addition($.u.x, $.u.y));
    },
  );

  const addThreeRecord = func(
    { arg: { a: i32 }, ret: i32, locals: { u: { x: i32, y: i32 } } },
    ($, ret) => {
      $.u = returnTwoRecord();
      ret(addition($.a, addition($.u.x, $.u.y)));
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
