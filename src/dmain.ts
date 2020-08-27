import { Module, i32 } from 'binaryen';
import { makeFunc, NIL } from './utils';
import { i32ops } from './core';

const { add, const: val } = i32ops;

const m = new Module();
m.setFeatures(512);

const func = makeFunc(m);

const addition = func(
  'addition',
  { arg: { a: i32, b: i32 }, ret: i32, vars: { u: i32 } },
  function(this: any) {
    this.u = add(this.a, this.b);
    this.ret = this.u; //return
  },
);

// const returnTwo = func(
//   'returnTwo',
//   [NIL, pair, [pair]],
//   ([u]) => [u(val(1), val(2)), u()],
//   false,
// );

// func('selectRight', [NIL, i32, [pair]], ([u]) => [u(returnTwo()), u[1]]);

// func('addTwo', [NIL, i32, [pair]], ([u]) => [
//   u(returnTwo()),
//   addition(u[0], u[1]),
// ]);

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
// console.log(exported.selectRight());
// console.log(exported.addTwo());
// console.log(exported.addThree(10));
