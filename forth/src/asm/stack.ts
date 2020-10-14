import { f32, i32 } from 'binaryen';
import { LibFunc, i32ops, f32ops } from '../../../esential/src';
import { f32Size, i32Size } from '../common/constants';
import { systemLib } from './system';

const { add, sub, load, store } = i32ops;
const { load: fload, store: fstore } = f32ops;

export const stackLib: LibFunc = ({ lib, func }) => {
  //
  lib(systemLib);

  const push = func(
    { params: { value: i32 } }, //
    (result, { value, psp }) => {
      result(
        //
        store(0, 0, psp, value),
        psp(add(psp, i32Size)),
      );
    },
  );

  const pop = func(
    { params: {} }, //
    (result, { psp }) => {
      result(
        //
        psp(sub(psp, i32Size)),
        load(0, 0, psp),
      );
    },
  );

  const peek = func(
    { params: {} }, //
    (result, { psp }) => {
      result(
        //
        load(0, 0, sub(psp, i32Size)),
      );
    },
  );

  const pushf = func(
    { params: { value: f32 } }, //
    (result, { value, psp }) => {
      result(
        //
        fstore(0, 0, psp, value),
        psp(add(psp, f32Size)),
      );
    },
  );

  const popf = func(
    { params: {}, result: f32 }, //
    (result, { psp }) => {
      result(
        //
        psp(sub(psp, f32Size)),
        fload(0, 0, psp),
      );
    },
  );

  const rpush = func(
    { params: { value: i32 } }, //
    (result, { value, rsp }) => {
      result(
        //
        store(0, 0, rsp, value),
        rsp(add(rsp, i32Size)),
      );
    },
  );

  const rpop = func(
    { params: {} }, //
    (result, { rsp }) => {
      result(
        //
        rsp(sub(rsp, i32Size)),
        load(0, 0, rsp),
      );
    },
  );

  return {
    push,
    pop,
    peek,
    pushf,
    popf,
    rpush,
    rpop,
  };
};
