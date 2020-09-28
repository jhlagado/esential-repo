import { HEIGHT, RGB_ALIVE, RGB_DEAD, BIT_ROT, WASM_FILENAME, WIDTH } from './common/constants';
import { calcNumPages } from './common/tools';
import { Exported } from './types';
import { addListeners } from './utils';

export const addAllListeners = (canvas: HTMLCanvasElement, document: Document, exported: Exported) => {
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
      exported.fill((loc.clientX - bcr.left) >>> 1, (loc.clientY - bcr.top) >>> 1, 0.5);
    },
  );
};
