import { i32 } from 'binaryen';
import { LibFunc } from 'esential/src';

export const ioLib: LibFunc = ({ external }) => {
  const log = external({
    namespace: 'env',
    name: 'log',
    params: { a: i32 },
  });

  return {
    log,
  };
};
