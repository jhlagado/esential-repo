export const asPages = (bytes: number) => {
  return ((bytes + 0xffff) & ~0xffff) >>> 16;
};

export const calcNumPages = (width: number, height: number) => {
  const size = width * height;
  const bytes = (size + size) / 4; // 4b per cell
  // return asPages(bytes) || 1;
  return asPages(bytes) || 1;
};
