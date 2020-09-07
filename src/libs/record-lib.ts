import { i32 } from 'binaryen';
import { ModDef } from '../types';
import { literal } from '../utils';
import { addLib } from './add-lib';

export const recordLib = ({ lib, func }: ModDef) => {
  const { addition } = lib(addLib);

  const returnTwoRecord = func({ export: false }, ({$, result}) => {
    $.u = { x: literal(1), y: literal(2) };
    result($.u);
  });

  const selectRightRecord = func({}, ({$, result}) => {
    $.u = returnTwoRecord();
    result($.u.y);
  });

  const addTwoRecord = func({}, ({$, result}) => {
    $.u = returnTwoRecord();
    result(addition($.u.x, $.u.y));
  });

  const addThreeRecord = func({ args: { a: i32 } }, ({$, result}) => {
    $.u = returnTwoRecord();
    result(addition($.a, addition($.u.x, $.u.y)));
  });

  return {
    selectRightRecord,
    addTwoRecord,
    addThreeRecord,
  };
};
