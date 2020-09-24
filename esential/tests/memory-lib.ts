import { i32, none } from 'binaryen';
import { LibFunc, ops } from 'esential/src';

export const memoryLib: LibFunc = ({ func, module }) => {
  const {
    i32: { load, store },
  } = ops(module);

  const storeAndLoad = func({ params: { a: i32 }, result: [i32] }, ({ vars: { a }, result }) => {
    result(
      //
      store(0, 0, 0, a),
      load(0, 0, 0),
    );
  });

  return {
    storeAndLoad,
  };
};
