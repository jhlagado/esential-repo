import { writeFileSync } from 'fs';
import { EsentialCfg, LibFunc, esential } from '.';

export const build = (library: LibFunc, filename: string, cfg?: EsentialCfg) => {
  const { lib, compile, module: m } = esential(cfg);
  lib(library);
  console.log(m.emitText());
  writeFileSync(filename, Buffer.from(compile()));
};
