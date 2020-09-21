import { LibFunc } from 'esential/src';

export const loopLib: LibFunc = ({ module: m, func, literal, FOR }) => {
  const looper = func({}, ({ $: { i, j }, result }) => {
    result(
      j(literal(0)),
      FOR(
        i(literal(10)),
        m.i32.gt_s(i(), literal(0)),
        i(m.i32.sub(i(), literal(1))),
      )(
        //
        j(m.i32.add(j(), literal(1))),
      ),
      j(),
    );
  });

  return {
    looper,
  };
};
