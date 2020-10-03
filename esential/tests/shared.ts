import { i32 } from 'binaryen';
import { LibFunc, ops } from '../src';


export const addLib: LibFunc = ({ func }) => {
  const {i32: { add }} = ops;
  //
  const addition = func(
    { params: { a: i32, b: i32 } },

    (result, { a, b, u }) => {
      result(
        //
        u(add(a, b)),
        u,
      );
    },
  );

  const increment = func(
    { params: { a: i32 } },

    (result, { a, u }) => {
      result(
        //
        u(add(a, 1)),
        u,
      );
    },
  );

  return {
    addition,
    increment,
  };
};

export const ioLib: LibFunc = ({ external }) => {
  //
  const log = external({
    namespace: 'env',
    name: 'log',
    params: { a: i32 },
  });

  return {
    log,
  };
};
