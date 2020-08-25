import { Module, i32, createType } from 'binaryen';
import { makeModule } from './utils';
import { FuncDef } from './types';

const module = makeModule(
  ({
    call,
    drop,
    getFunction,
    return: _return,
    i32: { add: _add, const: val },
    tuple: { make, extract },
  }: Module) => {
    //
    const add: FuncDef = [
      [i32, i32],
      i32,
      [i32],
      ([a, b, c]) => [c(_add(a(), b())), c()],
    ];

    const returnTwo: FuncDef = [
      [],
      [i32, i32],
      [],
      () => [_return(make([val(1), val(2)]))],
    ];

    const selectRight: FuncDef = [
      [],
      i32,
      [[i32, i32]],
      ([a]) => [
        a(call('returnTwo', [], createType([i32, i32]))),
        _return(extract(a(), 1)),
      ],
    ];

    const addTwo: FuncDef = [
      [],
      i32,
      [[i32, i32]],
      ([a]) => [
        a(call('returnTwo', [], createType([i32, i32]))),
        _return(call('add', [extract(a(), 0), extract(a(), 1)], i32)),
      ],
    ];

    const addThree: FuncDef = [
      i32,
      i32,
      [[i32, i32]],
      ([a, b]) => [
        b(call('returnTwo', [], createType([i32, i32]))),
        _return(
          call(
            'add',
            [a(), call('add', [extract(b(), 0), extract(b(), 1)], i32)],
            i32,
          ),
        ),
      ],
    ];

    return {
      add,
      returnTwo,
      selectRight,
      addTwo,
      addThree,
    };
  },
  ['add', 'selectRight', 'addTwo', 'addThree'],
);

console.log(module.emitText());

module.optimize();
if (!module.validate()) throw new Error('validation error');

const compiled = new WebAssembly.Module(module.emitBinary());
const instance = new WebAssembly.Instance(compiled, {});
const exported = instance.exports as any;
console.log(exported.add(41, 1));
console.log(exported.selectRight());
console.log(exported.addTwo());
console.log(exported.addThree(10));
console.log(module.getFunction('returnTwo'));
