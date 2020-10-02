import { i32 } from 'binaryen';
import { esential, LibFunc } from '../src';
import { addLib } from './shared';

export const tupleLib: LibFunc = ({ lib, func }) => {
  //
  const { addition } = lib(addLib);

  const returnTwo = func({ export: false }, (result, { u }) => {
    result(
      //
      u([1, 2]),
      u,
    );
  });

  const selectRight = func({}, (result, { u }) => {
    result(
      //
      u(returnTwo()),
      u[1],
    );
  });

  const addTwo = func({}, (result, { u }) => {
    result(
      //
      u(returnTwo()),
      addition(u[0], u[1]),
    );
  });

  const addThree = func({ params: { a: i32 } }, (result, { u, a }) => {
    result(
      //
      u(returnTwo()),
      addition(a, addition(u[0], u[1])),
    );
  });

  return {
    selectRight,
    addTwo,
    addThree,
  };
};

const { lib, load, compile } = esential();
lib(tupleLib);
const exported = load(compile());

it('should select the second tuple item', () => {
  expect(exported.selectRight()).toBe(2);
});
it('should add 2 tuple numbers', () => {
  expect(exported.addTwo()).toBe(3);
});
it('should add 2 tuple numbers and a passed in number', () => {
  expect(exported.addThree(10)).toBe(13);
});
