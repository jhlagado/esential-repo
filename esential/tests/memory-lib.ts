import { i32, none } from 'binaryen';
import { LibFunc } from 'esential/src';

export const memoryLib: LibFunc = ({ func, builtin }) => {
  const {
    i32: { load, store },
  } = builtin;

  const storeAndLoad = func({ params: { a: i32 }, result: [i32] }, ({ a }, result) => {
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
