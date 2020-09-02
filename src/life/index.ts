import { addListeners, rgb2bgr } from './utils';
import { Exported } from './types';

const RGB_ALIVE = 0xd392e6;
const RGB_DEAD = 0xa61b85;
const BIT_ROT = 10;

const addAllListeners = (canvas: HTMLCanvasElement, document: Document) => {
  // When clicked or dragged, fill the current row and column with random live cells
  let down = false;
  addListeners(
    [
      [canvas, 'mousedown'],
      [canvas, 'touchstart'],
    ],
    () => (down = true),
  );
  addListeners(
    [
      [document, 'mouseup'],
      [document, 'touchend'],
    ],
    () => (down = false),
  );
  addListeners(
    [
      [canvas, 'mousemove'],
      [canvas, 'touchmove'],
      [canvas, 'mousedown'],
    ],
    (e: any) => {
      if (!down) return;
      let loc: { clientX: number; clientY: number };
      if (e.touches) {
        if (e.touches.length > 1) return;
        loc = e.touches[0];
      } else {
        loc = e as MouseEvent;
      }
      const bcr = canvas.getBoundingClientRect();
      exports.fill(
        (loc.clientX - bcr.left) >>> 1,
        (loc.clientY - bcr.top) >>> 1,
        0.5,
      );
    },
  );
};

const run = async (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.imageSmoothingEnabled = false;
  // Set up the canvas with a 2D rendering context
  const bcr = canvas.getBoundingClientRect();

  // Compute the size of the universe (here: 2px per cell)
  const width = bcr.width >>> 1;
  const height = bcr.height >>> 1;
  const size = width * height;
  const byteSize = (size + size) << 2; // input & output (here: 4b per cell)

  canvas.width = width;
  canvas.height = height;
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
  // Compute the size of and instantiate the module's memory
  const memory = new WebAssembly.Memory({
    initial: ((byteSize + 0xffff) & ~0xffff) >>> 16,
  });

  // Fetch and instantiate the module
  fetch('build/optimized.wasm')
    .then(response => response.arrayBuffer())
    .then(buffer =>
      WebAssembly.instantiate(buffer, {
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
      }),
    )
    .then(module => {
      const exports = module.instance.exports as Exported;

      // Initialize the module with the universe's width and height
      exports.init(width, height);

      const mem = new Uint32Array(memory.buffer);

      // Update about 30 times a second
      (function update() {
        setTimeout(update, 1000 / 30);
        mem.copyWithin(0, size, size + size); // copy output to input
        exports.step(); // perform the next step
      })();

      // Keep rendering the output at [size, 2*size]
      const imageData = ctx.createImageData(width, height);
      const argb = new Uint32Array(imageData.data.buffer);
      (function render() {
        requestAnimationFrame(render);
        argb.set(mem.subarray(size, size + size)); // copy output to image buffer
        ctx.putImageData(imageData, 0, 0); // apply image buffer
      })();

      addAllListeners(canvas, document);
    })
    .catch(err => {
      alert('Failed to load WASM: ' + err.message + ' (ad blocker, maybe?)');
      console.log(err.stack);
    });
};

run(document.getElementsByTagName('canvas')[0]);
