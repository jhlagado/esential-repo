/* eslint-disable no-empty-pattern */
import { i32 } from 'binaryen';
import { ops } from './core';
import { ModDef } from './types';
import { val } from './utils';

const {
  i32: { add },
} = ops;

export const addLib = ({ func }: ModDef) => {
  const addition = func(
    { arg: { a: i32, b: i32 }, ret: i32, vars: { u: i32 } },

    (_, ret) => {
      _.u = add(_.a, _.b);
      ret(_.u);
    },
  );
  return {
    addition,
  };
};

export const tupleLib = ({ lib, func }: ModDef) => {
  const { addition } = lib(addLib);

  const returnTwo = func(
    { ret: [i32, i32], vars: { u: [i32, i32] }, export: false },
    (_, ret) => {
      _.u = [val(1), val(2)];
      ret(_.u);
    },
  );

  const selectRight = func({ ret: i32, vars: { u: [i32, i32] } }, (_, ret) => {
    _.u = returnTwo();
    ret(_.u[1]);
  });

  const addTwo = func({ ret: i32, vars: { u: [i32, i32] } }, (_, ret) => {
    _.u = returnTwo();
    ret(addition(_.u[0], _.u[1]));
  });

  const addThree = func(
    { arg: { a: i32 }, ret: i32, vars: { u: [i32, i32] } },
    (_, ret) => {
      _.u = returnTwo();
      ret(addition(_.a, addition(_.u[0], _.u[1])));
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
    { ret: { x: i32, y: i32 }, vars: { u: { x: i32, y: i32 } }, export: false },
    (_, ret) => {
      _.u = { x: val(1), y: val(2) };
      ret(_.u);
    },
  );

  const selectRightRecord = func(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (_, ret) => {
      _.u = returnTwoRecord();
      ret(_.u.y);
    },
  );

  const addTwoRecord = func(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (_, ret) => {
      _.u = returnTwoRecord();
      ret(addition(_.u.x, _.u.y));
    },
  );

  const addThreeRecord = func(
    { arg: { a: i32 }, ret: i32, vars: { u: { x: i32, y: i32 } } },
    (_, ret) => {
      _.u = returnTwoRecord();
      ret(addition(_.a, addition(_.u.x, _.u.y)));
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
