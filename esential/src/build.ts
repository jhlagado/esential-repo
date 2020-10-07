import { writeFileSync } from 'fs';
import { esential } from './context';
import { CompileOptions, EsentialCfg, LibFunc } from './types';

export const build = (
  library: LibFunc,
  filename: string,
  cfg?: EsentialCfg,
  compileOptions?: CompileOptions,
) => {
  const { lib, compile } = esential(cfg);
  lib(library);
  writeFileSync(filename, Buffer.from(compile(compileOptions)));
};
