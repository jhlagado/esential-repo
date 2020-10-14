import { Vector } from "./vector";

export function rand(n) {
  return Math.floor(Math.random() * n) + 1;
}

export function colorScale(n) {
  // Cheesy math to change the material color
  return Math.abs(n) / 40;
}

export const lorenzSystem = function(pos, sigma:number, rho:number, beta:number) {
  const x = sigma * (pos.y - pos.x),
    y = pos.x * (rho - pos.z) - pos.y,
    z = pos.x * pos.y - beta * pos.z;
  return new Vector(x, y, z);
};

