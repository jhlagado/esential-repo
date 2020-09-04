import { i32 } from 'binaryen';
import { ops } from './core';
import { Var, RetFunc, ModDef } from './types';
import { val } from './utils';

const {
  i32: { add },
} = ops;

export const addLib = ({ func }: ModDef) => {
  const addition = func(
    { arg: { a: i32, b: i32 }, ret: i32, vars: { u: i32 } },

    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = add(arg.a, arg.b);

      ret(vars.u);
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
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = [val(1), val(2)];
      ret(vars.u);
    },
  );

  const selectRight = func(
    { ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(vars.u[1]);
    },
  );

  const addTwo = func(
    { ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(addition(vars.u[0], vars.u[1]));
    },
  );

  const addThree = func(
    { arg: { a: i32 }, ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(addition(arg.a, addition(vars.u[0], vars.u[1])));
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
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = { x: val(1), y: val(2) };
      ret(vars.u);
    },
  );

  const selectRightRecord = func(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwoRecord();
      ret(vars.u.y);
    },
  );

  const addTwoRecord = func(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwoRecord();
      ret(addition(vars.u.x, vars.u.y));
    },
  );

  const addThreeRecord = func(
    { arg: { a: i32 }, ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwoRecord();
      ret(addition(arg.a, addition(vars.u.x, vars.u.y)));
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
