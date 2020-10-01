import { HEIGHT, WASM_FILENAME, WIDTH } from './common/constants';
import { calcNumPages } from './common/tools';
import { addAllListeners, isActive } from './listeners';
import { Exported } from './types';

const timer = (boardSize: number, mem: any, exported: any, increment: number, limit: number) => {
  var update = (divisor: number) => () => {
    setTimeout(update(Math.min(divisor + increment, limit)), 1000 / divisor);
    mem.copyWithin(0, boardSize, boardSize + boardSize);
    if (isActive()) exported.step();
  };
  setTimeout(update(1), 3000);
};

const run = async (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');
  if (!context) {
    return;
  }
  context.imageSmoothingEnabled = false;

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

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
          return Math.random() < 0.2;
        },
      },
    });

    const exported = module.instance.exports as Exported;

    exported.init(WIDTH, HEIGHT);
    console.log('wasm loaded');
    const mem = new Uint32Array(memory.buffer);
    const imageData = context.createImageData(WIDTH, HEIGHT);
    const pixels = new Uint32Array(imageData.data.buffer);

    (function render() {
      requestAnimationFrame(render);
      pixels.set(mem.subarray(boardSize, 2 * boardSize)); // copy output to image buffer
      context.putImageData(imageData, 0, 0); // apply image buffer
    })();
    timer(boardSize, mem, exported, 0.5, 60);
    addAllListeners(canvas, document, (x: number, y: number) => exported.fill(x, y));
  } catch (err) {
    alert('Failed to load WASM: ' + err.message + ' (ad blocker, maybe?)');
    console.log(err.stack);
  }
};

run(document.getElementsByTagName('canvas')[0]);
