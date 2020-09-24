import { LibFunc } from 'esential/src';

export const resultLib: LibFunc = ({ func }) => {
  const return1000 = func(
    { params: {} },

    (_vars, result) => {
      result(1000);
    },
  );

  const return2000 = func(
    {},

    ({ u }, result) => {
      result(
        //
        u(2000),
        u,
      );
    },
  );

  return {
    return1000,
    return2000,
  };
};
