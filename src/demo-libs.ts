import { i32 } from 'binaryen';
import { ops } from './core';
import { Var, RetFunc, ModType } from './types';
import { val } from './utils';

const {
  i32: { add },
} = ops;

export const addLib = (mod: ModType) => {
  const addition = mod.func(
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

export const tupleLib = (mod: ModType) => {
  const { addition } = mod.lib(addLib);

  const returnTwo = mod.func(
    { ret: [i32, i32], vars: { u: [i32, i32] }, export: false },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = [val(1), val(2)];
      ret(vars.u);
    },
  );

  const selectRight = mod.func(
    { ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(vars.u[1]);
    },
  );

  const addTwo = mod.func(
    { ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(addition(vars.u[0], vars.u[1]));
    },
  );

  const addThree = mod.func(
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

export const recordLib = (mod: ModType) => {
  const { addition } = mod.lib(addLib);

  const returnTwoRecord = mod.func(
    { ret: { x: i32, y: i32 }, vars: { u: { x: i32, y: i32 } }, export: false },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = { x: val(1), y: val(2) };
      ret(vars.u);
    },
  );

  const selectRightRecord = mod.func(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwoRecord();
      ret(vars.u.y);
    },
  );

  const addTwoRecord = mod.func(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwoRecord();
      ret(addition(vars.u.x, vars.u.y));
    },
  );

  const addThreeRecord = mod.func(
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

