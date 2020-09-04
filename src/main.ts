import { InitFunc, ModType } from './types';
import { Mod } from './modules';
import { addLib, tupleLib, recordLib } from './demo-libs';

export const mainLib = (mod: ModType) => {
  const { addition } = mod.lib(addLib as InitFunc);
  const { selectRight, addTwo, addThree } = mod.lib(tupleLib);
  const { selectRightRecord, addTwoRecord, addThreeRecord } = mod.lib(
    recordLib,
  );

  return {
    addition,
    selectRight,
    addTwo,
    addThree,
    selectRightRecord,
    addTwoRecord,
    addThreeRecord,
  };
};

const mod = Mod({});
mod.lib(mainLib);

console.log('Raw:', mod.emitText());
const exported = mod.compile();
console.log('Optimized:', mod.emitText());

console.log(exported.addition(41, 1));
console.log(exported.selectRight());
console.log(exported.addTwo());
console.log(exported.addThree(10));
console.log(exported.selectRightRecord());
console.log(exported.addTwoRecord());
console.log(exported.addThreeRecord(10));
