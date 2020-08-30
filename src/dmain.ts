import { Module, i32 } from 'binaryen';
import { makeFunc, NIL, val } from './utils';
import { prims } from './core';

const { add: i32Add } = prims[i32];

const m = new Module();
m.setFeatures(512);

const func = makeFunc(m);

const addition = func(
  'addition',
  { arg: { a: i32, b: i32 }, ret: i32, vars: { u: i32 } },
  (arg: any, ret: any, vars: any) => {
    vars.u = i32Add(arg.a, arg.b);
    ret(vars.u);
  },
);

const returnTwo = func(
  'returnTwo',
  { ret: [i32, i32], vars: { u: [i32, i32] } },
  (arg: any, ret: any, vars: any) => {
    vars.u = [val(1), val(2)];
    ret(vars.u);
  },
);

const selectRight = func(
  'selectRight',
  { ret: i32, vars: { u: [i32, i32] } },
  (arg: any, ret: any, vars: any) => {
    vars.u = returnTwo();
    ret(vars.u[1]);
  },
);

const addTwo = func(
  'addTwo',
  { ret: i32, vars: { u: [i32, i32] } },
  (arg: any, ret: any, vars: any) => {
    vars.u = returnTwo();
    ret(addition(vars.u[0], vars.u[1]));
  },
);

const addThree = func(
  'addThree',
  { arg: { a: i32 }, ret: i32, vars: { u: [i32, i32] } },
  (arg: any, ret: any, vars: any) => {
    vars.u = returnTwo();
    ret(addition(arg.a, addition(vars.u[0], vars.u[1])));
  },
);

// func('addThree', [i32, i32, [pair]], ([a, u]) => [
//   u(returnTwo()),
//   addition(a(), addition(u[0], u[1])),
// ]);

console.log('Raw:', m.emitText());

m.optimize();
if (!m.validate()) throw new Error('validation error');

console.log('Optimized:', m.emitText());

const compiled = new WebAssembly.Module(m.emitBinary());
const instance = new WebAssembly.Instance(compiled, {});
const exported = instance.exports as any;
console.log(exported.addition(41, 1));
console.log(exported.selectRight());
console.log(exported.addTwo());
console.log(exported.addThree(10));
