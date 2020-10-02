import { i32 } from 'binaryen';
import { esential, LibFunc, asPages } from '../src';

export const memoryLib: LibFunc = ({ func, i32: { load, store } }) => {
  //
  const setMem = func({ params: { ptr: i32, a: i32 } }, (result, { ptr, a }) => {
    result(
      //
      store(0, 0, ptr, a),
    );
  });

  const getMem = func({ params: { ptr: i32 } }, (result, { ptr }) => {
    result(
      //
      load(0, 0, ptr),
    );
  });

  const storeAndLoad = func({ params: { ptr: i32, a: i32 } }, (result, { ptr, a }) => {
    result(
      //
      setMem(ptr, a),
      getMem(ptr),
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
  expect(exported.storeAndLoad(100, 346)).toBe(346);
});
