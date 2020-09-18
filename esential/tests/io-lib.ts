import { i32 } from 'binaryen';
import { LibFunc } from 'esential/src';

export const ioLib: LibFunc = ({ func }) => {
  const log = func({ namespace: 'env', name: 'log', params: { a: i32 }, external: true });

  return {
    log,
  };
};
