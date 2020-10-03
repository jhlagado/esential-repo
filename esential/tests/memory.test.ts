import { i32 } from 'binaryen';
import { esential, LibFunc, asPages } from '../src';

const i32Size = 4;

export const memoryLib: LibFunc = ({ func, globals, i32: { add, sub, load, store } }) => {
  //

  globals(
    { ptr: i32 },
    {
      ptr: 0,
    },
  );

  const push = func({ params: { value: i32 } }, (result, { ptr, value }) => {
    result(
      //
      store(0, 0, ptr, value),
      ptr(add(ptr, i32Size)),
    );
  });

  const pop = func({ params: {} }, (result, { ptr }) => {
    result(
      //
      ptr(sub(ptr, i32Size)),
      load(0, 0, ptr),
    );
  });

  const pushAndPop = func({ params: { value: i32 } }, (result, { value }) => {
    result(
      //
      push(value),
      pop(),
    );
  });

  return {
    pushAndPop,
  };
};

const pages = asPages(500000);
const size = { initial: pages, maximum: pages };
const instance = new WebAssembly.Memory(size);

const { lib, load, compile } = esential({ memory: { ...size, instance } });

lib(memoryLib);

const exported = load(compile());

it('should store a number and return it', () => {
  expect(exported.pushAndPop(346)).toBe(346);
});
