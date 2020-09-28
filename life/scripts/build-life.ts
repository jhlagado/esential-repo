import { build } from '@jhlagado/esential';
import { lifeLib } from '../src/asm/life';
import { WIDTH, HEIGHT } from '../src/common/constants';
import { calcNumPages } from '../src/common/tools';

const pages = calcNumPages(WIDTH, HEIGHT);
console.log(pages);
const size = { initial: pages, maximum: pages };
const instance = new WebAssembly.Memory(size);

build(lifeLib, 'dist/life.wasm', {
  memory: { ...size, instance },
});
