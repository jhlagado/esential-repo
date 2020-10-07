import { build } from '../../esential/src';
import { mainLib } from '../src/asm/main';
import { WIDTH, HEIGHT } from '../src/common/constants';
import { calcNumPages } from '../src/common/tools';

const pages = calcNumPages(WIDTH, HEIGHT);
console.log(pages);

const memoryDef = {
  initial: pages,
  maximum: pages,
};
const tableDef = { initial: 10, maximum: 100 }; 

build(mainLib, 'dist/main.wasm', { memory: memoryDef, table: tableDef },{ debugOptimized: false });
