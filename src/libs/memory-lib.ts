import { i32 } from 'binaryen';
import { LibFunc, Dict, builtin, asPages } from '../esential';

export const memoryLib: LibFunc = (
  { memory, func, module, literal },
  { pages = 1 }: Dict<any> = {},
) => {
  const load = builtin(module.i32.load, i32);
  const store = builtin(module.i32.store, i32);

  memory({ namespace: 'env', name: 'memory', initial: pages, maximum: pages });

  const storeAndLoad = func({ params: { a: i32 }, result: [i32] }, ({ $, result }) => {
    result(store(0, 0, literal(0), $.a), load(0, 0, literal(0)));
  });

  return {
    storeAndLoad,
  };
};
