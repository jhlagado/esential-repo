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
        rnd: () => {
          return Math.random() < 0.2;
        },
      },
    });

    const exported = module.instance.exports as Exported;

    const value = exported.init(WIDTH, HEIGHT);
    console.log('wasm loaded', value);
  } catch (err) {
    alert('Failed to load WASM: ' + err.message);
  }
};

run();