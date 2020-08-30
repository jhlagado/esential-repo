import { i32 } from 'binaryen';
import { moduleCompile, makeModule } from './modules';
import { prims } from './core';
import { Var, RetFunc, MakeFunc } from './types';
import { val } from './utils';

const { add: i32Add } = prims[i32];

const mod = makeModule((makeFunc: MakeFunc) => {
  const addition = makeFunc(
    { arg: { a: i32, b: i32 }, ret: i32, vars: { u: i32 } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = i32Add(arg.a, arg.b);
      ret(vars.u);
    },
  );

  const returnTwo = makeFunc(
    { ret: [i32, i32], vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = [val(1), val(2)];
      ret(vars.u);
    },
  );

  const selectRight = makeFunc(
    { ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(vars.u[1]);
    },
  );

  const addTwo = makeFunc(
    { ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(addition(vars.u[0], vars.u[1]));
    },
  );

  const addThree = makeFunc(
    { arg: { a: i32 }, ret: i32, vars: { u: [i32, i32] } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(addition(arg.a, addition(vars.u[0], vars.u[1])));
    },
  );

  const returnTwoRecord = makeFunc(
    { ret: { x: i32, y: i32 }, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = { x: val(1), y: val(2) };
      ret(vars.u);
    },
  );

  const selectRightRecord = makeFunc(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwoRecord();
      ret(vars.u.y);
    },
  );

  const addTwoRecord = makeFunc(
    { ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwoRecord();
      ret(addition(vars.u.x, vars.u.y));
    },
  );

  const addThreeRecord = makeFunc(
    { arg: { a: i32 }, ret: i32, vars: { u: { x: i32, y: i32 } } },
    (arg: Var, ret: RetFunc, vars: Var) => {
      vars.u = returnTwo();
      ret(addition(arg.a, addition(vars.u.x, vars.u.y)));
    },
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
});

console.log('Raw:', mod.emitText());
const exported = moduleCompile(mod);
console.log('Optimized:', mod.emitText());

console.log(exported.addition(41, 1));
console.log(exported.selectRight());
console.log(exported.addTwo());
console.log(exported.addThree(10));
console.log(exported.selectRightRecord());
console.log(exported.addTwoRecord());
console.log(exported.addThreeRecord(10));
