import { i32 } from 'binaryen';
import { esential, LibFunc, i32ops } from '../src';
import { callableInfoMap } from '../src/maps';

export const indirectLib: LibFunc = ({ func, indirect }) => {
  //
  const { add } = i32ops;

  const indirectAddition = indirect(
    { params: { a: i32, b: i32 } },

    (result, { a, b }) => {
      result(add(a, b));
    },
  );

  const indirect123 = func(
    { params: { a: i32, b: i32 }, result: i32 },

    (result, { a, b }) => {
      result(indirectAddition(a, b));
    },
  );

  const getCallableIndex = func({}, result => {
    const callable = indirectAddition;
    const info = callableInfoMap.get(callable);
    const index = info? info.index : -1;
    console.log(info);
    result(index);
  });

  return {
    indirectAddition,
    indirect123,
    getCallableIndex,
  };
};

const tableDef = { initial: 10, maximum: 100 };

const { lib, load, compile } = esential({ table: { ...tableDef } });
lib(indirectLib);

const exported = load(compile());

it('should add 2 numbers indirectly', () => {
  expect(exported.indirect123(300, 200)).toBe(500);
});

it('should return the index of the indirect function', () => { 
  expect(exported.getCallableIndex()).toBe(0);
});
