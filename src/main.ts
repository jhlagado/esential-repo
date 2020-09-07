import { Mod } from './modules';
import { ioLib } from './libs/io-lib';
import { addLib } from './libs/add-lib';
import { tupleLib } from './libs/tuple-lib';
import { recordLib } from './libs/record-lib';

const { lib, emitText, compile } = Mod();
lib(ioLib);
lib(addLib);
lib(tupleLib);
lib(recordLib);

console.log('---------------------------------------');
// console.log('Raw:', emitText());
const exported = compile();
// console.log('Optimized:', emitText());

console.log(exported.addition(41, 1));
console.log(exported.selectRight());
console.log(exported.addTwo());
console.log(exported.addThree(10));
console.log(exported.selectRightRecord());
console.log(exported.addTwoRecord());
console.log(exported.addThreeRecord(10));

exported.print123();
