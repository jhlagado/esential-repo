import { build } from '../esential/build';
import { lifeLib } from '../life/asm/life';

build(lifeLib, 'dist/life.wasm');
