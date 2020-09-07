import { Mod } from './modules';
import { importsLib, addLib, tupleLib, recordLib } from './demo-libs';

const { lib, emitText, compile } = Mod();
lib(importsLib);
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
