import { i32, none } from 'binaryen';
import { LibFunc } from 'esential';

export const memoryLib: LibFunc = ({ func, i32: { load, store } }) => {
  //
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
