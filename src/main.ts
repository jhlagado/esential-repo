import { i32, Module } from 'binaryen';
import { ops } from './core';
import { Var, RetFunc, InitFunc, ModType } from './types';
import { val } from './utils';
import { Mod } from './modules';

const {
  i32: { add },
} = ops;

const addLib = (mod: ModType) => {
  const addition = mod.makeFunc(
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

const tupleLib = (mod: ModType) => {
  const { addition } = mod.initLib(addLib);

  const returnTwo = mod.makeFunc(
    { ret: [i32, i32], vars: { u: [i32, i32] }, export: false },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = [val(1), val(2)];
      ret(vars.u);
    },
  );

  const selectRight = mod.makeFunc(
    { ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(vars.u[1]);
    },
  );

  const addTwo = mod.makeFunc(
    { ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(addition(vars.u[0], vars.u[1]));
    },
  );

  const addThree = mod.makeFunc(
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

const recordLib = (mod: ModType) => {
  const { addition } = mod.initLib(addLib);

  const returnTwoRecord = mod.makeFunc(
    { ret: { x: i32, y: i32 }, vars: { u: { x: i32, y: i32 } }, export: false },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = { x: val(1), y: val(2) };
      ret(vars.u);
    },
  );

  const selectRightRecord = mod.makeFunc(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwoRecord();
      ret(vars.u.y);
    },
  );

  const addTwoRecord = mod.makeFunc(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwoRecord();
      ret(addition(vars.u.x, vars.u.y));
    },
  );

  const addThreeRecord = mod.makeFunc(
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

const mainLib = (mod: ModType) => {
  const { addition } = mod.initLib(addLib as InitFunc);
  const { selectRight, addTwo, addThree } = mod.initLib(tupleLib);
  const { selectRightRecord, addTwoRecord, addThreeRecord } = mod.initLib(
    recordLib,
  );

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

const module = new Module();
const mod = Mod(module);
mod.initLib(mainLib);

console.log('Raw:', mod.emitText());
const exported = mod.compile();
console.log('Optimized:', mod.emitText());

console.log(exported.addition(41, 1));
console.log(exported.selectRight());
console.log(exported.addTwo());
console.log(exported.addThree(10));
console.log(exported.selectRightRecord());
console.log(exported.addTwoRecord());
console.log(exported.addThreeRecord(10));
