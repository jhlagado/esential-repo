import { i32 } from 'binaryen';
import { LibFunc } from 'esential/src';
import { addLib } from './add-lib';

export const tupleLib: LibFunc = ({ lib, func, literal }) => {
  const { addition } = lib(addLib);

  const returnTwo = func({ export: false }, ({ vars: { u }, result }) => {
    result(
      //
      u([literal(1), literal(2)]),
      u(),
    );
  });

  const selectRight = func({}, ({ vars: { u }, result }) => {
    result(
      //
      u(returnTwo()),
      u()[1],
    );
  });

  const addTwo = func({}, ({ vars: { u }, result }) => {
    result(
      //
      u(returnTwo()),
      addition(u()[0], u()[1]),
    );
  });

  const addThree = func({ params: { a: i32 } }, ({ vars: { u, a }, result }) => {
    result(
      //
      u(returnTwo()),
      addition(a(), addition(u()[0], u()[1])),
    );
  });

  return {
    selectRight,
    addTwo,
    addThree,
  };
};
