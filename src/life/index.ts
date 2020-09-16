import { HEIGHT, RGB_ALIVE, RGB_DEAD, BIT_ROT, WASM_FILENAME, WIDTH } from './common/constants';
import { Exported } from './types';
import { calcNumPages, rgb2bgr } from './utils';

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

const run = async (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.imageSmoothingEnabled = false;

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

  const boardSize = WIDTH * HEIGHT;
  const memory = new WebAssembly.Memory({
    initial: calcNumPages(500, 500),
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
    if (sanity !== 1000) {
      throw new Error(`Couldn't initialise wasm file`);
    }
    console.log('wasm loaded');

    const mem = new Uint32Array(memory.buffer);

    // Update about 30 times a second
    (function update() {
      setTimeout(update, 1000 / 30);
      mem.copyWithin(0, boardSize, boardSize + boardSize); // copy output to input
      exports.step(); // perform the next step
    })();

    // Keep rendering the output at [size, 2*size]
    const imageData = ctx.createImageData(WIDTH, HEIGHT);
    const argb = new Uint32Array(imageData.data.buffer);
    (function render() {
      requestAnimationFrame(render);
      argb.set(mem.subarray(boardSize, boardSize + boardSize)); // copy output to image buffer
      ctx.putImageData(imageData, 0, 0); // apply image buffer
    })();

    // addAllListeners(canvas, document);
  } catch (err) {
    alert('Failed to load WASM: ' + err.message + ' (ad blocker, maybe?)');
    console.log(err.stack);
  }
};

run(document.getElementsByTagName('canvas')[0]);
