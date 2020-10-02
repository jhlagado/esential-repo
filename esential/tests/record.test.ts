import { i32 } from 'binaryen';
import { esential, LibFunc } from '../src';
import { addLib } from './shared';

export const recordLib: LibFunc = ({ lib, func }) => {
  //
  const { addition } = lib(addLib);

  const returnTwoRecord = func({ export: false }, (result, { u }) => {
    result(
      //
      u({ x: 1, y: 2 }),
      u,
    );
  });

  const selectRightRecord = func({}, (result, { u }) => {
    result(
      //
      u(returnTwoRecord()),
      u.y,
    );
  });

  const addTwoRecord = func({}, (result, { u }) => {
    result(
      //
      u(returnTwoRecord()),
      addition(u.x, u.y),
    );
  });

  const addThreeRecord = func({ params: { a: i32 } }, (result, { u, a }) => {
    result(
      //
      u(returnTwoRecord()),
      addition(a, addition(u.x, u.y)),
    );
  });

  return {
    selectRightRecord,
    addTwoRecord,
    addThreeRecord,
  };
};

const { lib, load, compile } = esential();
lib(recordLib);
const exported = load(compile());

it('should select the second record item', () => {
  expect(exported.selectRightRecord()).toBe(2);
});
it('should add 2 record numbers', () => {
  expect(exported.addTwoRecord()).toBe(3);
});
it('should add 2 record numbers and a passed in number', () => {
  expect(exported.addThreeRecord(10)).toBe(13);
});
