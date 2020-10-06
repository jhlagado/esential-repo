import { HEIGHT, WASM_FILENAME, WIDTH } from './common/constants';
import { calcNumPages } from './common/tools';
import { Exported } from './types';

const run = async (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  if (!context) return;

  context.imageSmoothingEnabled = false;
  const pages = calcNumPages(WIDTH, HEIGHT);
  const boardSize = WIDTH * HEIGHT;

  const memory = new WebAssembly.Memory({
    initial: pages,
    maximum: pages,
  });

  const table = new WebAssembly.Table({
    initial: 10,
    maximum: 100,
    element: "anyfunc",
  });

  try {
    const response = await fetch(WASM_FILENAME);
    const buffer = await response.arrayBuffer();
    const module = await WebAssembly.instantiate(buffer, {
      env: {
        memory,
        table,
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
      Math,
    } as any);

    const exported = module.instance.exports as Exported;

    exported.init(WIDTH, HEIGHT);
    console.log('wasm loaded');
    const mem = new Uint32Array(memory.buffer);
    const imageData = context.createImageData(WIDTH, HEIGHT);
    const pixels = new Uint32Array(imageData.data.buffer);
  } catch (err) {
    alert('Failed to load WASM: ' + err.message);
  }
};

run(document.getElementsByTagName('canvas')[0]);
