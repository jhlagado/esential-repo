interface VM {
  exports: WebAssembly.Exports;
  buffer: number[];
  arrayToBase64: (bytes: Buffer) => string;
  emit: (c: number) => void;
}

const defaultWasmModule: BufferSource = require('../waforth.wasm');

const defaultArrayToBase64 = (bytes: Buffer) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const defaultEmit = (c: number) => {
  console.log(String.fromCharCode(c));
}

const getc = (vm: VM) => () => {
  if (vm.buffer.length === 0) {
    return -1;
  }
  return vm.buffer.pop();
}

const debug = (d: number) => {
  console.log('DEBUG: ', d, String.fromCharCode(d));
}

const key = () => {
  let c;
  while (c == null || c == '') {
    c = window.prompt('Enter character');
  }
  return c.charCodeAt(0);
}

const accept = (vm: VM) => (p: number, n: number) => {
  const memory = vm.exports.memory as WebAssembly.Memory;
  const input = (window.prompt('Enter text') || '').substr(0, n);
  const target = new Uint8Array(memory.buffer, p, input.length);
  for (let i = 0; i < input.length; ++i) {
    target[i] = input.charCodeAt(i);
  }
  console.log('ACCEPT', p, n, input.length);
  return input.length;
}

const load = (vm: VM) => (offset: number, length: number, index: number) => {
  const memory = vm.exports.memory as WebAssembly.Memory;
  const table = vm.exports.table as WebAssembly.Table;
  const data = new Uint8Array(
    memory.buffer,
    offset,
    length,
  );
  if (index >= table.length) {
    table.grow(table.length); // Double size
  }
  const module = new WebAssembly.Module(data);
  new WebAssembly.Instance(module, {
    env: { table, memory, tos: -1 },
  });
}

export const vmRead = (vm: VM, s: string) => {
  const data = new TextEncoder().encode(s);
  for (let i = data.length - 1; i >= 0; --i) {
    vm.buffer.push(data[i]);
  }
}

export const vmRun = (vm: VM, s: string) => {
  vmRead(vm, s);
  try {
    const interpret = vm.exports.interpret as Function;
    return interpret();
  } catch (e) {
    console.log(e);
  }
}

export const vmCreate = async (
  wasmModule = defaultWasmModule,
  arrayToBase64 = defaultArrayToBase64,
  emit = defaultEmit
) => {
  const vm: VM = {
    exports: {},
    buffer: [],
    arrayToBase64,
    emit,
  };
  const source = await WebAssembly.instantiate(wasmModule, {
    shell: {
      emit,
      getc: getc(vm),
      debug,
      key,
      accept: accept(vm),
      load: load(vm),
    },
  });
  vm.exports = source.instance.exports;
  return vm;
}

