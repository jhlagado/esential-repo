import { build } from '../../esential/src';
import { lifeLib } from '../src/asm/life';
import { WIDTH, HEIGHT } from '../src/common/constants';
import { calcNumPages } from '../src/common/tools';

const pages = calcNumPages(WIDTH, HEIGHT);
console.log(pages);
const size = { initial: pages, maximum: pages };

build(lifeLib, 'dist/life.wasm', {
  memory: { ...size },
});
