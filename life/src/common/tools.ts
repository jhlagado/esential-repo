export const asPages = (bytes: number) => {
  return ((bytes + 0xffff) & ~0xffff) >>> 16;
};

export const calcNumPages = (width: number, height: number) => {
  const size = width * height;
  const bytes = (size + size) * 4; // 4b per cell
  return asPages(bytes) || 1;
};

export const log = (number: number) => {
  let hex = number;
  if (hex < 0) hex = 0xffffffff + hex + 1;

  console.log(hex.toString(16), `(${number})`);
  return;
};

export const rnd = () => {
  return Math.random() < 0.2;
};
