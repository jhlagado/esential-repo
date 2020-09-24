# Esential - Support for WebAssembly in Javascript

Here is your ECMAScripten! `Esential` is a framework from writing WebAssembly code without leaving JavaScript.

`Esential` is built using [JavaScript bindings](https://github.com/AssemblyScript/binaryen.js) to Binaryen which is a high performance compiler and infrastructure libabry for WebAssembly. [Binaryen](https://github.com/WebAssembly/binaryen) produces very optimised and clean code but its C++ inspired bindings are tedious and error prone to use from JavaScript. `Esential` aims to make use `Binaryen` as simple as possible without needing to leave JavaScript for any other language. It attempts to intelligently infer types and to make the process of coding as familiar as possible without imposing more load on the JS programmer than is absolutely necessary.

Let's take a look at a simple example program in `Binaryen` and contrast it to `Esential`

First `Binaryen`:

```js
var binaryen = require('binaryen');

// Create a module with a single function
var myModule = new binaryen.Module();

myModule.addFunction(
  'add',
  binaryen.createType([binaryen.i32, binaryen.i32]),
  binaryen.i32,
  [binaryen.i32],
  myModule.block(null, [
    myModule.local.set(
      2,
      myModule.i32.add(myModule.local.get(0, binaryen.i32), myModule.local.get(1, binaryen.i32)),
    ),
    myModule.return(myModule.local.get(2, binaryen.i32)),
  ]),
);
myModule.addFunctionExport('add', 'add');

// Optimize the module using default passes and levels
myModule.optimize();

// Validate the module
if (!myModule.validate()) throw new Error('validation error');

// Generate text format and binary
console.log(emitText());
var wasmData = myModule.emitBinary();

// Example usage with the WebAssembly API
var compiled = new WebAssembly.Module(wasmData);
var instance = new WebAssembly.Instance(compiled, {});
console.log(instance.exports.add(41, 1));
```

And now the same thing in `Esential`

```js
import { i32 } from 'binaryen';
import { esential } from 'esential/src';

const { lib, module, load, compile } = esential();

lib(({ func, builtin }) => {
  const {
    i32: { add },
  } = builtin;

  const addition = func({ params: { a: i32, b: i32 } }, (result, { a, b, u }) => {
    result(
      //
      u(add(a, b)),
      u,
    );
  });
  return {
    addition,
  };
});

const exported = load(compile());
console.log(exported.addition(41, 1));
```

Here's another example. Say you want to loop 10 times. You have two variables, one which starts at 0 and the other at 10. On each iteration, decrement the first variable until it reaches zero and increment the second varibale until it reaches 10. Finally return the second variable.

First in `Binaryen`

```js
import { Module } from 'binaryen';
import binaryen from 'binaryen';

const m: Module = new binaryen.Module();

m.addFunction(
  'add',
  binaryen.createType([]),
  binaryen.i32,
  [binaryen.i32, binaryen.i32],
  m.block(null as any, [
    m.local.set(0, m.i32.const(10)),
    m.local.set(1, m.i32.const(0)),
    m.block('afterLoop', [
      m.loop(
        'loop',
        m.block(null as any, [
          m.br('afterLoop', m.i32.eqz(m.local.get(0, binaryen.i32))),
          m.local.set(0, m.i32.sub(m.local.get(0, binaryen.i32), m.i32.const(1))),
          m.local.set(1, m.i32.add(m.local.get(1, binaryen.i32), m.i32.const(1))),
          m.br('loop'),
        ]),
      ),
    ]),
    m.return(m.local.get(1, binaryen.i32)),
  ]),
);
m.addFunctionExport('add', 'add');
if (!m.validate()) throw new Error('validation error');

console.log('raw:', m.emitText());
m.optimize();
console.log('opt:', m.emitText());

const compiled = new WebAssembly.Module(m.emitBinary());
const instance: any = new WebAssembly.Instance(compiled, {});
console.log(instance.exports.add(41, 1));
```

Then in `Esential`

```js
import { i32 } from 'binaryen';
import { esential } from 'esential/src';

const { lib, load, compile } = esential();

lib(({ func, builtin, FOR }) => {
  const {
    i32: { add, sub, gt_s: gt },
  } = builtin;

  const eloop = func({ params: { a: i32, b: i32 } }, (result, { i, j }) => {
    result(
      j(0),
      FOR(
        i(10),
        gt(i, 0),
        i(sub(i, 1)),
      )(
        //
        j(add(j, 1)),
      ),
      j,
    );
  });
  return {
    eloop,
  };
});

const exported = load(compile());
console.log(exported.eloop());
```

And here is a slightly more complicated function in `Esential` which counts to 10 and adds up the even numbers and the odd numbers and returns the odd total.

```js
import { esential } from 'esential/src';

const { lib, load, compile } = esential();

lib(({ func, builtin, FOR, IF }) => {

  const {
    i32: { add, lt, eqz, rem },
  } = builtin;

  const eloop2 = func({}, (result, { odd, even, i }) => {
    result(
      odd(0),
      even(0),
      FOR(
        i(0),
        lt(i, 10),
        i(add(i, 1)),
      )(
        //
        IF(eqz(rem(i, 2)))(
          //
          even(add(even, 1)),
        )(
          //
          odd(add(odd, 1)),
        ),
      ),
      odd,
    );
  });

  return {
    eloop2,
  };
});

const exported = load(compile());
console.log(exported.eloop2());
```

## Running with experimental switches

This code relies on a post-MVP feature, multi-value returns. To run from Node, it needs to be started with an experimental flag to enable muti-value returns

### Running jest with switch

node --experimental-wasm-mv node_modules/.bin/jest

### Running ts-node with switch

node --experimental-wasm-mv -r ts-node/register

### setup tests in vscode

Jest: Path To Jest
`node --experimental-wasm-mv node_modules/jest/bin/jest.js`
