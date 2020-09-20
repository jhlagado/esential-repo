import { LibFunc } from 'esential/src';

export const globalsLib: LibFunc = ({ module: m, lib, func, literal, FOR, IF }) => {
  const global1000 = func({}, ({ $, result }) => {
    result(
      //
      $({ u: literal(1000) }),
      literal(1000),
    );
  });

  return {
    global1000,
  };
};
