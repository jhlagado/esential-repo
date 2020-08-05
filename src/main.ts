import wabtModule from 'wabt';
import mainWat from './main.wat';

const compileModule: any = async (input: string, importObject: any) => {
  const wabt = await wabtModule();
  const { buffer } = wabt.parseWat('module', input).toBinary({});
  const module = await WebAssembly.compile(buffer);
  const instance = await WebAssembly.instantiate(module, importObject);
  return instance.exports;
};

export interface Adder {
  addTwo: (p1: number, p2: number) => number;
}

export const compileAdder = async (importObject: any) => {
  console.log(mainWat);
  const module = await compileModule(mainWat, importObject);
  return module as Adder;
};
