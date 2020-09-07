import { i32, none, i64 } from 'binaryen';
import { ops } from './core';
import { ModDef } from './types';
import { literal, builtin } from './utils';

const {
  i32: { add },
} = ops;

const add1 = builtin(add, i32);

export const importsLib = ({ imp, func, getModule }: ModDef) => {
  const log = imp(
    { namespace: 'env', name: 'log', args: { a: i32 } },

    (a: number) => {
      console.log(a);
      return;
    },
  );

  const print100 = func({}, ($, result, effect) => {
    effect(log(literal(100)));
    // result(literal(0));
    // result();
  });

  return {
    // log,
    print100,
  };
};

export const addLib = ({ func }: ModDef) => {
  const addition = func(
    { args: { a: i32, b: i32 } },

    ($, result) => {
      $.u = add1($.a, $.b);
      result($.u);
    },
  );
  return {
    addition,
  };
};

export const tupleLib = ({ lib, func }: ModDef) => {
  const { addition } = lib(addLib);

  const returnTwo = func({ export: false }, ($, result) => {
    $.u = [literal(1), literal(2)];
    result($.u);
  });

  const selectRight = func({}, ($, result) => {
    $.u = returnTwo();
    result($.u[1]);
  });

  const addTwo = func({}, ($, result) => {
    $.u = returnTwo();
    result(addition($.u[0], $.u[1]));
  });

  const addThree = func({ args: { a: i32 } }, ($, result) => {
    $.u = returnTwo();
    result(addition($.a, addition($.u[0], $.u[1])));
  });

  return {
    selectRight,
    addTwo,
    addThree,
  };
};

export const recordLib = ({ lib, func }: ModDef) => {
  const { addition } = lib(addLib);

  const returnTwoRecord = func({ export: false }, ($, result) => {
    $.u = { x: literal(1), y: literal(2) };
    result($.u);
  });

  const selectRightRecord = func({}, ($, result) => {
    $.u = returnTwoRecord();
    result($.u.y);
  });

  const addTwoRecord = func({}, ($, result) => {
    $.u = returnTwoRecord();
    result(addition($.u.x, $.u.y));
  });

  const addThreeRecord = func({ args: { a: i32 } }, ($, result) => {
    $.u = returnTwoRecord();
    result(addition($.a, addition($.u.x, $.u.y)));
  });

  return {
    selectRightRecord,
    addTwoRecord,
    addThreeRecord,
  };
};

export const mainLib = ({ lib }: ModDef) => {
  lib(importsLib);
  // lib(addLib);
  // lib(tupleLib);
  // lib(recordLib);

  return {};
};
