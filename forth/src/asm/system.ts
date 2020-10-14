import { i32, f32, none } from 'binaryen';
import { LibFunc } from '../../../esential/src';
import { pStackStart, rStackStart, sStackStart, userStart } from '../common/constants';

export const systemLib: LibFunc = ({ globals, external }) => {
  //
  globals(
    { psp: i32, rsp: i32, ssp: i32, HERE: i32, IP: i32, width: i32, height: i32, offset: i32 },
    {
      psp: pStackStart,
      rsp: rStackStart,
      ssp: sStackStart,
      HERE: userStart,
      IP: 0,
      width: 0,
      height: 0,
      offset: 0,
    },
  );

  const log = external({
    namespace: 'env',
    name: 'log',
    params: { a: i32 },
    result: none,
  });

  const sqrt = external({
    namespace: 'Math',
    name: 'sqrt',
    params: { a: i32 },
    result: f32,
  });

  return { log, sqrt };
};
