import { i32, none } from 'binaryen';
import { esential, LibFunc, asPages } from '../src';

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

const pages = asPages(500000);
const size = { initial: pages, maximum: pages };
const instance = new WebAssembly.Memory(size);

const { lib, load, compile, module } = esential({ memory: { ...size, instance } });

lib(memoryLib);

const exported = load(compile());

it('should store a number and return it', () => {
  expect(exported.storeAndLoad(346)).toBe(346);
});
