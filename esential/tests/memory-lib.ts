import { i32, none } from 'binaryen';
import { LibFunc } from 'esential/src';

export const memoryLib: LibFunc = ({ func, ops }) => {
  const { load, store } = ops.i32;

  const storeAndLoad = func({ params: { a: i32 }, result: [i32] }, (result, { a }) => {
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
