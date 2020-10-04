import { HEIGHT, WASM_FILENAME, WIDTH } from './common/constants';
import { calcNumPages } from './common/tools';
import { Exported } from './types';

const run = async () => {
  const pages = calcNumPages(WIDTH, HEIGHT);
  const memory = new WebAssembly.Memory({
    initial: pages,
    maximum: pages,
  });
  try {
    const response = await fetch(WASM_FILENAME);
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.instantiate(buffer, {
      env: {
        memory,
        abort: function() {
          return;
        },
        log: (number: number) => {
          let hex = number;
          if (hex < 0) hex = 0xffffffff + hex + 1;

          console.log(hex.toString(16), `(${number})`);
          return;
        },
      },
      Math,
    } as any);

    const exported = module.instance.exports as Exported;

    const value = exported.init(6, 5);
    console.log('wasm loaded', value);
  } catch (err) {
    alert('Failed to load WASM: ' + err.message);
  }
};

run();
