import { Module, createType, i32 } from 'binaryen';

const zeroItemType = createType([]);
const twoItemType = createType([i32, i32]);

const m = new Module();
m.setFeatures(512); // Features.Multivalue has a bug

m.addFunction(
  'add',
  createType([i32, i32]),
  i32,
  [i32],
  m.block(null as any, [
    m.local.set(2, m.i32.add(m.local.get(0, i32), m.local.get(1, i32))),
    m.return(m.local.get(2, i32)),
  ]),
);
m.addFunctionExport('add', 'add');

m.addFunction(
  'returnTwo',
  zeroItemType,
  twoItemType,
  [],
  m.return(m.tuple.make([m.i32.const(1), m.i32.const(2)])),
);

m.addFunction(
  'selectTwo',
  zeroItemType,
  i32,
  [],
  m.block(null as any, [
    m.return(m.tuple.extract(m.call('returnTwo', [], twoItemType), 1)),
  ]),
);
m.addFunctionExport('selectTwo', 'selectTwo');

m.addFunction(
  'addTwo',
  zeroItemType,
  i32,
  [twoItemType, i32],
  m.block(null as any, [
    m.local.set(0, m.call('returnTwo', [], twoItemType)),
    m.return(
      m.call(
        'add',
        [
          m.tuple.extract(m.local.get(0, twoItemType), 0),
          m.tuple.extract(m.local.get(0, twoItemType), 1),
        ],
        i32,
      ),
    ),
  ]),
);
m.addFunctionExport('addTwo', 'addTwo');

m.optimize();
if (!m.validate()) throw new Error('validation error');

const textData = m.emitText();
console.log(textData);

const compiled = new WebAssembly.Module(m.emitBinary());
const instance = new WebAssembly.Instance(compiled, {});
const exported = instance.exports as any;
console.log(exported.add(41, 1));
console.log(exported.selectTwo(41, 1));
console.log(exported.addTwo());
