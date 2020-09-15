import { EventTuple } from './types';

export const rgb2bgr = (rgb: number) => {
  return ((rgb >>> 16) & 0xff) | (rgb & 0xff00) | ((rgb & 0xff) << 16);
};

export const addListeners = (array: EventTuple[], handler: (evt: Event) => void) => {
  for (const [element, eventName] of array) {
    element.addEventListener(eventName, handler);
  }
};

export const asPages = (bytes: number) => {
  return ((bytes + 0xffff) & ~0xffff) >>> 16;
}

export const calcNumPages = (width: number, height: number) => {
  const size = width * height;
  const bytes = (size + size) / 4 // 4b per cell
  // return asPages(bytes) || 1;
  return asPages(bytes) || 1;
};
