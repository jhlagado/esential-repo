import { i32 } from 'binaryen';
import { ModDef } from '../types';
import { literal } from '../utils';

export const ioLib = ({ imp, func }: ModDef) => {
  const log = imp(
    { namespace: 'env', name: 'log', args: { a: i32 } },

    (a: number) => {
      console.log(a);
      return;
    },
  );

  const print123 = func({}, ({ effect }) => {
    effect(log(literal(1)), log(literal(2)), log(literal(3)));
  });

  return {
    log,
    print123,
  };
};
