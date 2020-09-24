import { i32 } from 'binaryen';
import { LibFunc } from 'esential/src';
import { addLib } from './add-lib';

export const tupleLib: LibFunc = ({ lib, func }) => {
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
