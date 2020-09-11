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
