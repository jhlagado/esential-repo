import { build } from '../esential/build';
import { lifeLib } from '../life/asm/life';
import { WIDTH, HEIGHT } from '../life/common/constants';
import { calcNumPages } from '../life/common/tools';

const pages = calcNumPages(WIDTH, HEIGHT);
console.log(pages);
const size = { initial: pages, maximum: pages };
const instance = new WebAssembly.Memory(size);

build(lifeLib, 'dist/life.wasm', { memory: { ...size, instance } });
