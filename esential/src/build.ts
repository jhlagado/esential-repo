import { writeFileSync } from 'fs';
import { LibFunc, EsentialCfg, esential } from '.';

export const build = (library: LibFunc, filename: string, cfg?: EsentialCfg) => {
  const { lib, compile, module: m } = esential(cfg);
  lib(library);
  console.log('raw:', m.emitText());
  writeFileSync(filename, Buffer.from(compile()));
  console.log('optimized:', m.emitText());
};
