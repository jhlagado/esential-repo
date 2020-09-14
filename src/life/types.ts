export type EventTuple = [HTMLElement | Document, string];

export type Exported = {
  init: (width: number, height: number) => number;
  step: () => void;
  fill: (x: number, y: number, n: number) => void;
};
