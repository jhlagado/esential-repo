import { i32 } from 'binaryen';
import { LibFunc, i32ops, Callable, block, getIndirectIndex } from '../../../esential/src';

const { add, store } = i32ops;

export const compileLib: LibFunc = ({ func, indirect }) => {
  //
  const WRITE = func({ params: { data: i32 } }, (result, { data, HERE }) => {
    result(
      //
      store(0, 0, HERE, data),
      HERE(add(HERE, 1)),
      0,
    );
  });

  const doColon = indirect({}, (result, {}) => {});

  const COMPILE = (cfa: Callable, ...items: number[]) => {
    const CFA = getIndirectIndex(cfa);
    return block(
      WRITE(0), //flags
      WRITE(CFA),
      ...items.map(item => WRITE(item)),
    );
  };

  return {
    COMPILE,
    doColon,
  };
};
