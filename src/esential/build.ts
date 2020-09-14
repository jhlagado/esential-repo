import { writeFileSync } from 'fs';
import { esential } from './esential';
import { Dict, LibFunc } from './types';

const { lib, compile, module: m } = esential();

export const build = (library: LibFunc, filename: string, args?: Dict<string>) => {
  lib(library, args);
  console.log(m.emitText());
  writeFileSync(filename, Buffer.from(compile()));
};
