import { esential } from '@jhlagado/esential';
import { loopLib } from './loop-lib';
import { writeFileSync } from 'fs';

const { lib, module, compile } = esential();

lib(loopLib);

const binary = compile();
writeFileSync('./dist/x.wasm', Buffer.from(binary));
