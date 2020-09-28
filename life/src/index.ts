import { HEIGHT, RGB_ALIVE, RGB_DEAD, BIT_ROT, WASM_FILENAME, WIDTH } from './common/constants';
import { calcNumPages } from './common/tools';
import { addAllListeners } from './events';
import { Exported } from './types';
import { addListeners } from './utils';

const run = async (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }
  context.imageSmoothingEnabled = false;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  canvas.style.cssText = `
  image-rendering: optimizeSpeed;
  image-rendering: pixelated;
`;

  const pages = calcNumPages(WIDTH, HEIGHT);
  const boardSize = WIDTH * HEIGHT;
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
          return Math.random() < 0.1;
        },
      },
    });

    const exported = module.instance.exports as Exported;

    const sanity = exported.init(WIDTH, HEIGHT);
    console.log('wasm loaded', sanity.toString(10));

    const mem = new Uint32Array(memory.buffer);

    (function update() {
      setTimeout(update, 1000 / 60);
      mem.copyWithin(0, boardSize, boardSize + boardSize);
      exported.step();
    })();

    const imageData = context.createImageData(WIDTH, HEIGHT);
    const pixels = new Uint32Array(imageData.data.buffer);

    (function render() {
      requestAnimationFrame(render);
      pixels.set(mem.subarray(boardSize, 2 * boardSize)); // copy output to image buffer
      context.putImageData(imageData, 0, 0); // apply image buffer
    })();

    addAllListeners(canvas, document, exported);
  } catch (err) {
    alert('Failed to load WASM: ' + err.message + ' (ad blocker, maybe?)');
    console.log(err.stack);
  }
};

run(document.getElementsByTagName('canvas')[0]);
