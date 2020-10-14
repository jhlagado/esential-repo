import { RGB_ALIVE, RGB_DEAD } from './common/constants';

export let width: number = 0;
export let height: number = 0;
export let offset: number = 0;

let mem8: Uint8Array;
let mem32: Uint32Array;
let rnd: () => boolean;

const getPos = (x: number, y: number, ofs: number) => {
  const y0 = y * width;
  return Math.floor(ofs + y0 + x);
};

const getPixel = (x: number, y: number) => mem32[getPos(x, y, 0)];

const setPixel = (x: number, y: number, v: number) => {
  mem32[getPos(x, y, offset)] = v;
};

const fadePixel = (x: number, y: number) => {
  const pos8 = getPos(x, y, 0) * 4 + 3;
  let alpha = mem8[pos8] - 1;
  if (alpha < 0) {
    alpha = 0;
  }
  mem8[pos8] = alpha;
};

const getM1 = (x: number, limit: number) => (x === 0 ? limit : x) - 1;

const getP1 = (x: number, limit: number) => (x === limit - 1 ? 0 : x + 1);

const isAlive = (x: number, y: number) => getPixel(x, y) & 1;

const countNeighbors = (x: number, y: number) => {
  const xm1 = getM1(x, width);
  const xp1 = getP1(x, width);
  const ym1 = getM1(y, height);
  const yp1 = getP1(y, height);

  const aa = isAlive(xm1, ym1);
  const ab = isAlive(x, ym1);
  const ac = isAlive(xp1, ym1);
  const ba = isAlive(xm1, y);
  const bc = isAlive(xp1, y);
  const ca = isAlive(xm1, yp1);
  const cb = isAlive(x, yp1);
  const cc = isAlive(xp1, yp1);

  return aa + (ab + (ac + (ba + (bc + (ca + (cb + cc))))));
};

const randomize = () => {
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      if (rnd()) {
        setPixel(i, j, RGB_ALIVE);
      } else {
        setPixel(i, j, RGB_DEAD);
      }
    }
  }
};

export const setup = (imports: any) => {
  const memory = imports.env.memory;
  mem8 = new Uint8Array(memory.buffer);
  mem32 = new Uint32Array(memory.buffer);
  rnd = imports.env.rnd;
};

export const init = (w: number, h: number) => {
  width = w;
  height = h;
  offset = w * h;
  randomize();
};

export const step = () => {
  for (let j = 0; j < height; j++) {
    for (let i = 0; i < width; i++) {
      fadePixel(i, j);
      const count = countNeighbors(i, j);
      let pixel = getPixel(i, j);

      if (count < 2) {
        pixel = RGB_DEAD;
      }
      if (count > 3) {
        pixel = RGB_DEAD;
      }
      if (count === 3) {
        pixel = RGB_ALIVE;
      }

      setPixel(i, j, pixel);
    }
  }
};

export const fill = (x: number, y: number) => {
  const top = Math.floor((y / 4) * 3);
  const right = Math.floor(x + (width - x) / 4);
  const bottom = Math.floor(y + (height - y) / 4);
  const left = Math.floor((x / 4) * 3);
  for (let i = left; i < right; i++) {
    setPixel(i, top, RGB_ALIVE);
    setPixel(i, bottom, RGB_ALIVE);
  }
  for (let j = top; j < bottom; j++) {
    setPixel(left, j, RGB_ALIVE);
    setPixel(right, j, RGB_ALIVE);
  }
};
