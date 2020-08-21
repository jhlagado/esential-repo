import { parseText } from "binaryen";

const src = `(module
  (type $none_=>_i32 (func (result i32)))
  (type $i32_i32_=>_i32 (func (param i32 i32) (result i32)))
  (export "add" (func $add))
  (export "returnOne" (func $returnOne))
  (export "selectTwo" (func $selectTwo))
  (func $add (; has Stack IR ;) (param $0 i32) (param $1 i32) (result i32)
   (i32.add
    (local.get $0)
    (local.get $1)
   )
  )
  (func $returnOne (; has Stack IR ;) (result i32)
   (i32.const 1)
  )
  (func $selectTwo (; has Stack IR ;) (result i32)
   (i32.const 2)
  )
 )`

const mod = parseText(src);

mod.optimize();
if (!mod.validate())
  throw new Error("validation error");

const textData = mod.emitText();
console.log(textData);

const compiled = new WebAssembly.Module(mod.emitBinary());
const instance = new WebAssembly.Instance(compiled, {});
const exported = instance.exports as any;
console.log(exported.add(41, 1));
console.log(exported.returnOne(41, 1));
console.log(exported.selectTwo(41, 1));
