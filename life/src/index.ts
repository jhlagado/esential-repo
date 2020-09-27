import { HEIGHT, RGB_ALIVE, RGB_DEAD, BIT_ROT, WASM_FILENAME, WIDTH } from './common/constants';
import { calcNumPages } from './common/tools';
import { Exported } from './types';
import { rgb2bgr } from './utils';

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
  image-rendering: -moz-crisp-edges;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: -o-crisp-edges;
  image-rendering: optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
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
          return Math.random() < 0.5;
        },
      },
      config: {
        BGR_ALIVE: rgb2bgr(RGB_ALIVE) | 1, // little endian, LSB must be set
        BGR_DEAD: rgb2bgr(RGB_DEAD) & ~1, // little endian, LSB must not be set
        BIT_ROT,
      },
      Math: Math as any,
    });

    const exports = module.instance.exports as Exported;

    const sanity = exports.init(WIDTH, HEIGHT);
    console.log('wasm loaded', sanity.toString(10));

    const mem = new Uint32Array(memory.buffer);

    (function update() {
      setTimeout(update, 1000 / 3); 
      mem.copyWithin(0, boardSize, boardSize + boardSize); 
      exports.step();
    })();

    const imageData = context.createImageData(WIDTH, HEIGHT);
    const pixels = new Uint32Array(imageData.data.buffer);

    (function render() {
      requestAnimationFrame(render);
      pixels.set(mem.subarray(boardSize, 2 * boardSize)); // copy output to image buffer
      context.putImageData(imageData, 0, 0); // apply image buffer
    })();

    // addAllListeners(canvas, document);
  } catch (err) {
    alert('Failed to load WASM: ' + err.message + ' (ad blocker, maybe?)');
    console.log(err.stack);
  }
};

run(document.getElementsByTagName('canvas')[0]);

// const addAllListeners = (canvas: HTMLCanvasElement, document: Document) => {
//   // When clicked or dragged, fill the current row and column with random live cells
//   let down = false;
//   addListeners(
//     [
//       [canvas, 'mousedown'],
//       [canvas, 'touchstart'],
//     ],
//     () => (down = true),
//   );
//   addListeners(
//     [
//       [document, 'mouseup'],
//       [document, 'touchend'],
//     ],
//     () => (down = false),
//   );
//   addListeners(
//     [
//       [canvas, 'mousemove'],
//       [canvas, 'touchmove'],
//       [canvas, 'mousedown'],
//     ],
//     (e: any) => {
//       if (!down) return;
//       let loc: { clientX: number; clientY: number };
//       if (e.touches) {
//         if (e.touches.length > 1) return;
//         loc = e.touches[0];
//       } else {
//         loc = e as MouseEvent;
//       }
//       const bcr = canvas.getBoundingClientRect();
//       exports.fill((loc.clientX - bcr.left) >>> 1, (loc.clientY - bcr.top) >>> 1, 0.5);
//     },
//   );
// };
