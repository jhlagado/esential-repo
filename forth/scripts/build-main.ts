import { build } from '../../esential/src';
import { mainLib } from '../src/asm/main';
import { WIDTH, HEIGHT } from '../src/common/constants';
import { calcNumPages } from '../src/common/tools';

const pages = calcNumPages(WIDTH, HEIGHT);
console.log(pages);
const size = { initial: pages, maximum: pages };
const instance = new WebAssembly.Memory(size);

build(mainLib, 'dist/main.wasm', {
  memory: { ...size, instance },
});
