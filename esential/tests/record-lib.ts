import { i32 } from 'binaryen';
import { LibFunc } from 'esential/src';
import { addLib } from './add-lib';

export const recordLib: LibFunc = ({ lib, func, literal }) => {
  const { addition } = lib(addLib);

  const returnTwoRecord = func({ export: false }, ({ vars: { u }, result }) => {
    result(
      //
      u({ x: literal(1), y: literal(2) }),
      u(),
    );
  });

  const selectRightRecord = func({}, ({ vars: { u }, result }) => {
    result(
      //
      u(returnTwoRecord()),
      u().y,
    );
  });

  const addTwoRecord = func({}, ({ vars: { u }, result }) => {
    result(
      //
      u(returnTwoRecord()),
      addition(u().x, u().y),
    );
  });

  const addThreeRecord = func({ params: { a: i32 } }, ({ vars: { u, a }, result }) => {
    result(
      //
      u(returnTwoRecord()),
      addition(a(), addition(u().x, u().y)),
    );
  });

  return {
    selectRightRecord,
    addTwoRecord,
    addThreeRecord,
  };
};
