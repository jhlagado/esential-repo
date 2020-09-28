import { EventTuple } from './types';

export const rgb2bgr = (rgb: number) => {
  return ((rgb >>> 16) & 0xff) | (rgb & 0xff00) | ((rgb & 0xff) << 16);
};

export const addListeners = (array: EventTuple[], handler: (evt: Event) => void) => {
  for (const [element, eventName] of array) {
    element.addEventListener(eventName, handler);
  }
};
