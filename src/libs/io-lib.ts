import { i32 } from 'binaryen';
import { ModDef } from '../types';
import { literal } from '../utils';

export const ioLib = ({ external, func }: ModDef) => {
  const log = external(
    { namespace: 'env', name: 'log', params: { a: i32 } },

    (a: number) => {
      console.log(a);
      return;
    },
  );

  const print123 = func({}, ({ block }) => {
    block(log(literal(1)), log(literal(2)), log(literal(3)));
  });

  return {
    log,
    print123,
  };
};
