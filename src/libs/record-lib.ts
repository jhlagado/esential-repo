import { i32 } from 'binaryen';
import { LibFunc } from '../types';
import { addLib } from './add-lib';

export const recordLib: LibFunc = ({ lib, func, literal }) => {
  const { addition } = lib(addLib);

  const returnTwoRecord = func({ export: false }, ({ $, result }) => {
    result(
      //
      $({ u: { x: literal(1), y: literal(2) } }),
      $.u,
    );
  });

  const selectRightRecord = func({}, ({ $, result }) => {
    result(
      //
      $({ u: returnTwoRecord() }),
      $.u.y,
    );
  });

  const addTwoRecord = func({}, ({ $, result }) => {
    result(
      //
      $({ u: returnTwoRecord()}),
      addition($.u.x, $.u.y),
    );
  });

  const addThreeRecord = func({ params: { a: i32 } }, ({ $, result }) => {
    result(
      //
      $({ u: returnTwoRecord()}),
      addition($.a, addition($.u.x, $.u.y)),
    );
  });

  return {
    selectRightRecord,
    addTwoRecord,
    addThreeRecord,
  };
};
