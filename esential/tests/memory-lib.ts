import { i32, none } from 'binaryen';
import { LibFunc } from '../src';

export const memoryLib: LibFunc = ({ func, i32: { load, store } }) => {
  //
  const setMem = func({ params: { a: i32 }, result: none }, (result, { a }) => {
    result(
      //
      store(0, 0, 10, a),
      // 0,
    );
  });

  const storeAndLoad = func({ params: { a: i32 }, result: [i32] }, (result, { a }) => {
    result(
      //
      setMem(a),
      load(0, 0, 10),
    );
  });

  return {
    storeAndLoad,
  };
};
