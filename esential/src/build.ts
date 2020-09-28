import { writeFileSync } from 'fs';
import { esential } from './context';
import { EsentialCfg, LibFunc } from './types';

export const build = (library: LibFunc, filename: string, cfg?: EsentialCfg) => {
  const { lib, compile, module: m } = esential(cfg);
  lib(library);
  writeFileSync(filename, Buffer.from(compile({ debugRaw: true, debugOptimized: true })));
};
