import { HEIGHT, WIDTH } from './common/constants';
import { Exported } from './types';
import { addListeners } from './utils';

let active = true;

export const isActive = () => active;

window.addEventListener('focus', () => active = true);
window.addEventListener('blur', () => active = false);

export const addAllListeners = (
  canvas: HTMLCanvasElement,
  document: Document,
  callback: (x: number, y: number) => void,
) => {
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
