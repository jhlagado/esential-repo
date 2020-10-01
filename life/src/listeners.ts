import { HEIGHT, WIDTH } from './common/constants';
import { Exported } from './types';
import { addListeners } from './utils';

let active = true;

export const isActive = () => active;

window.onfocus = function() {
  console.log('focused');
  active = true;
};
window.onblur = function() {
  console.log('unfocused');
  active = false;
};

export const addAllListeners = (
  canvas: HTMLCanvasElement,
  document: Document,
  exported: Exported,
  callback: (x: number, y: number) => void,
) => {
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
      const x = (loc.clientX - bcr.left)/(bcr.width)* WIDTH;
      const y = (loc.clientY - bcr.top)/(bcr.height)* HEIGHT;
      console.log({x,y})
      if (callback) callback(x, y);
    },
  );
};
