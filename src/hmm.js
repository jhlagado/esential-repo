/* eslint-disable @typescript-eslint/no-var-requires */

// try {
//   const result = require('child_process')
//     .execSync('npx tsc x.ts')
//     .toString();
//   console.log(result);
// } catch (err) {
//   console.error(err.status);
// }

const run = async () => {
  const { readFileSync } = require('fs');
  const wabt = await require('wabt')();

  const inputWat = __dirname + '/main.wat';

  const wasmModule = wabt.parseWat(inputWat, readFileSync(inputWat, 'utf8'));
  const binary = wasmModule.toBinary({});

  const module = await WebAssembly.compile(binary.buffer);
  const instance = await WebAssembly.instantiate(module);
  console.log(instance.exports.helloWorld());
};

run();
