export type EventTuple = [HTMLElement | Document, string];

export type Exported = {
  init: (width: number, height: number) => void;
  step: () => void;
  fill: (x: number, y: number, n: number) => void;
};
