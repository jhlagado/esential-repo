export const WASM_FILENAME = 'main.wasm';
export const WIDTH = 500;
export const HEIGHT = 500;

export const RGB_ALIVE = 0xffffc0c1;
export const RGB_DEAD = 0xffa70000;
export const BIT_ROT = 10;

export const i32Size = 4;
export const f32Size = 4;

export const boardSize = WIDTH * HEIGHT;
export const pStackSize = 1000;
export const rStackSize = 1000;
export const sStackSize = 1000;
export const userSize = 1000;

export const memStart = 0;
export const board0 = memStart;
export const board1 = board0 + boardSize;
export const varsStart = board1 + boardSize;

export const here = varsStart;
export const latest = here + i32Size;
export const pStackStart = latest + i32Size;
export const pStackEnd = pStackStart + pStackSize;
export const rStackStart = pStackEnd;
export const rStackEnd = rStackStart + rStackSize;
export const sStackStart = rStackEnd;
export const sStackEnd = sStackStart + sStackSize;
export const userStart = sStackEnd;
export const userEnd = userStart + userSize;
