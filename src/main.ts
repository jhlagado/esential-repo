import wabtModule from 'wabt';

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
  const module = await compileModule(
    `(module
        (import "console" "log" (func $log (param i32)))
        (func $addTwo (export "addTwo") (param $p1 i32) (param $p2 i32) (result i32) (local $l1 i32)
          local.get 0
          local.get 1
          i32.add
          local.set $l1
          local.get $l1
          call $log
          local.get $l1
        )
      )
    `,
    importObject,
  );
  return module as Adder;
};

