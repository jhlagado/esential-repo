import { i32 } from 'binaryen';
import { LibFunc } from '../src';
import { addLib } from './add-lib';

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
