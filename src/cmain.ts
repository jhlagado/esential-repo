import { Module, i32 } from 'binaryen';
import { makeModule } from './utils';

const m1 = makeModule(
  (m: Module) => ({
    add: [
      [[i32, i32], i32, [i32]],
      ([a, b, c]) => [c(m.i32.add(a(), b())), c()],
    ],
  }),
  ['add'],
);

m1.optimize();
if (!m1.validate()) throw new Error('validation error');

const textData = m1.emitText();
console.log(textData);

const compiled = new WebAssembly.Module(m1.emitBinary());
const instance = new WebAssembly.Instance(compiled, {});
const exported = instance.exports as any;
console.log(exported.add(41, 1));
