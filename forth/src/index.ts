import { boardSize, HEIGHT, WASM_FILENAME, WIDTH } from './common/constants';
import { calcNumPages } from './common/tools';
import { addAllListeners, isActive } from './listeners';
import { Exported } from './types';

const timer = (boardSize: number, mem: any, exported: any, increment: number, limit: number) => {
  var update = (divisor: number) => () => {
    setTimeout(update(Math.min(divisor + increment, limit)), 1000 / divisor);
    mem.copyWithin(0, boardSize, boardSize + boardSize);
    if (isActive()) exported.step();
  };
  setTimeout(update(1), 1000);
};

const run = async (canvas: HTMLCanvasElement) => {
  const context = canvas.getContext('2d');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  if (!context) return;

  context.imageSmoothingEnabled = false;
  const pages = calcNumPages(WIDTH, HEIGHT);

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

    const value = exported.init(WIDTH, HEIGHT);
    console.log('wasm loaded',value);
    const mem = new Uint32Array(memory.buffer);
    const imageData = context.createImageData(WIDTH, HEIGHT);
    const pixels = new Uint32Array(imageData.data.buffer);

    (function render() {
      requestAnimationFrame(render);
      pixels.set(mem.subarray(boardSize, 2 * boardSize)); // copy output to image buffer
      context.putImageData(imageData, 0, 0); // apply image buffer
    })();
    timer(boardSize, mem, exported, 1, 60);
    addAllListeners(canvas, document, (x: number, y: number) => exported.fill(x, y));
    
  } catch (err) {
    alert('Failed to load WASM: ' + err.message);
  }
};

run(document.getElementsByTagName('canvas')[0]);
