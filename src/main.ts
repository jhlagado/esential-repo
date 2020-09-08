import { Mod } from './modules';
import { ioLib } from './libs/io-lib';
import { addLib } from './libs/add-lib';
import { tupleLib } from './libs/tuple-lib';
import { recordLib } from './libs/record-lib';
import { memoryLib } from './libs/memory-lib';

const { lib, emitText, compile } = Mod();
lib(memoryLib, { width: 500, height: 500 });
lib(ioLib);
lib(addLib);
lib(tupleLib);
lib(recordLib);

console.log('---------------------------------------');
console.log('Raw:', emitText());
const exported = compile();
console.log('Optimized:', emitText());

console.log(exported.addition(41, 1));
console.log(exported.selectRight());
console.log(exported.addTwo());
console.log(exported.addThree(10));
console.log(exported.selectRightRecord());
console.log(exported.addTwoRecord());
console.log(exported.addThreeRecord(10));

exported.print123();
console.log(exported.mem256());
