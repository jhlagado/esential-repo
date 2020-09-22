import { i32, none } from 'binaryen';
import { LibFunc, builtin } from 'esential/src';

export const memoryLib: LibFunc = ({ func, module }) => {
  const load = builtin(
    module,
    module.i32.load,
    { offset: none, align: none, ptr: i32, value: i32 },
    i32,
  );
  const store = builtin(module, module.i32.store, { offset: none, align: none, ptr: i32 }, i32);

  const storeAndLoad = func({ params: { a: i32 }, result: [i32] }, ({ vars: { a }, result }) => {
    result(
      //
      store(0, 0, 0, a()),
      load(0, 0, 0),
    );
  });

  return {
    storeAndLoad,
  };
};
