import { i32 } from 'binaryen';
import { LibFunc } from '../types';

export const ioLib: LibFunc = ({ external }) => {
  const log = external(
    { namespace: 'env', name: 'log', params: { a: i32 } },

    (a: number) => {
      console.log(a);
      return;
    },
  );

  return {
    log,
  };
};
