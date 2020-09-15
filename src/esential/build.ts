import { writeFileSync } from 'fs';
import { esential } from './esential';
import { Dict, LibFunc } from './types';


export const build = (library: LibFunc, filename: string, args?: Dict<string>) => {
  const { lib, compile, module: m } = esential(args);
  lib(library);
  console.log(m.emitText());
  writeFileSync(filename, Buffer.from(compile()));
};
