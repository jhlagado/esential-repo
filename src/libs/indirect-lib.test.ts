import { esential } from '../esential';
import { indirectLib } from './indirect-lib';

const { lib, load, compile, module } = esential();
lib(indirectLib);
console.log('raw:', module.emitText());

const exported = load(compile({ table: { initial: 10, maximum: 100 } }), {
  env: {
    table: new WebAssembly.Table({ initial: 10, maximum: 100, element: 'anyfunc' }),
  },
});

it('should add 2 numbers indirectly', () => {
  expect(exported.indirect123(300, 200)).toBe(500);
});
