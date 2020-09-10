import { i32 } from 'binaryen';
import { LibFunc } from '../types';
import { addLib } from './add-lib';
import { literal } from '../typedefs';

export const recordLib: LibFunc = ({ lib, func }) => {
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

  const addThreeRecord = func({ params: { a: i32 } }, ({$, result}) => {
    $.u = returnTwoRecord();
    result(addition($.a, addition($.u.x, $.u.y)));
  });

  return {
    selectRightRecord,
    addTwoRecord,
    addThreeRecord,
  };
};
