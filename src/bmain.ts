import { Module, createType, i32 } from "binaryen";

// Create a module with a single function
const mod = new Module();
mod.addFunction("add", createType([i32, i32]), i32, [i32],
  mod.block(null as any, [
    mod.local.set(2,
      mod.i32.add(
        mod.local.get(0, i32),
        mod.local.get(1, i32)
      )
    ),
    mod.return(
      mod.local.get(2, i32)
    )
  ])
);
mod.addFunctionExport("add", "add");

mod.addFunction("returnOne", createType([]), createType([i32]), [i32],
  mod.return(
    mod.i32.const(1)
  )
);

mod.addFunctionExport("returnOne", "returnOne");

mod.addFunction("returnTwo", createType([]), createType([i32, i32]), [i32],
  mod.return(
    mod.tuple.make([
      mod.i32.const(1),
      mod.i32.const(2)
    ])
  )
);

mod.addFunction("selectTwo", createType([]), i32, [],
  mod.block(null as any, [
    mod.return(
      mod.tuple.extract(
        mod.call("returnTwo", [], createType([i32, i32])), 1
      )
    )
  ])
);

mod.addFunctionExport("selectTwo", "selectTwo");

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
