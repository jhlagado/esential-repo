import { esential, LibFunc } from '../src';

export const resultLib: LibFunc = ({ func }) => {
  //
  const return1000 = func(
    { params: {} },

    (result, {}) => {
      result(1000);
    },
  );

  const return2000 = func(
    {},

    (result, { u }) => {
      result(
        //
        // block(
          //
          u(2000),
          u,
        // ),
      );
    },
  );

  return {
    return1000,
    return2000,
  };
};

const { lib, load, compile } = esential();
lib(resultLib);
const exported = load(compile());

it('should return a number', () => {
  expect(exported.return1000()).toBe(1000);
});

it('should return another number', () => {
  expect(exported.return2000()).toBe(2000);
});
