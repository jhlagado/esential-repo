import { writeFileSync } from 'fs';
import { LibFunc, EsentialCfg, esential } from '.';

export const build = (library: LibFunc, filename: string, cfg?: EsentialCfg) => {
  const { lib, compile, module: m } = esential(cfg);
  lib(library);
  writeFileSync(filename, Buffer.from(compile({ debugRaw: true, debugOptimized: true })));
};
