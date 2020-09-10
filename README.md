# Esential - Support for WebAssembly in Javascript

Here is your ECMAScripten! Esential is a framework from writing WebAssembly code without leaving JavaScript.

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
import { Mod } from './modules';
import { ops } from './core';
import { builtin } from './typedefs';

const { lib, emitText, run } = Mod();
const add = builtin(ops.i32.add, i32);

lib(({ func }) => {
  const addition = func(
    { params: { a: i32, b: i32 } },

    ({ $, result }) => {
      $.u = add($.a, $.b);
      result($.u);
    },
  );
  return {
    addition,
  };
});

const exported = start();
console.log(emitText());
console.log(exported.addition(41, 1));
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
