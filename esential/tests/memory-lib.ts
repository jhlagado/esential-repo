import { i32 } from 'binaryen';
import { LibFunc, builtin } from 'esential/src';

export const memoryLib: LibFunc = ({ func, module, literal }) => {
  const load = builtin(module, module.i32.load, i32);
  const store = builtin(module, module.i32.store, i32);

  const storeAndLoad = func({ params: { a: i32 }, result: [i32] }, ({ vars: { a }, result }) => {
    result(
      //
      store(0, 0, literal(0), a()),
      load(0, 0, literal(0)),
    );
  });

  return {
    storeAndLoad,
  };
};
