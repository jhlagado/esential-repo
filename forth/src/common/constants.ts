export const WASM_FILENAME = 'main.wasm';
export const WIDTH = 500;
export const HEIGHT = 500;

export const i32Size = 4;
export const pStackSize = 1000;
export const rStackSize = 1000;
export const userSize = 1000;

export const memStart = 0;
export const here = memStart;
export const latest = here + i32Size;
export const pStackStart = latest + i32Size;
export const pStackEnd = pStackStart + pStackSize;
export const rStackStart = pStackEnd;
export const rStackEnd = rStackStart + rStackSize;
export const userStart = rStackEnd;
export const userEnd = userStart + userSize;
