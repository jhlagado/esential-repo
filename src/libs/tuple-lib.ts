import { i32 } from 'binaryen';
import { LibFunc } from '../types';
import { addLib } from './add-lib';

export const tupleLib: LibFunc = ({ lib, func }) => {
  const { addition } = lib(addLib);

  const returnTwo = func({ export: false }, ({ $, result }) => {
    result(
      //
      $({ u: [$(1), $(2)] }),
      $.u,
    );
  });

  const selectRight = func({}, ({ $, result }) => {
    result(
      //
      $({ u: returnTwo() }),
      $.u[1],
    );
  });

  const addTwo = func({}, ({ $, result }) => {
    result(
      //
      $({ u: returnTwo() }),
      addition($.u[0], $.u[1]),
    );
  });

  const addThree = func({ params: { a: i32 } }, ({ $, result }) => {
    result(
      //
      $({ u: returnTwo() }),
      addition($.a, addition($.u[0], $.u[1])),
    );
  });

  return {
    selectRight,
    addTwo,
    addThree,
  };
};
