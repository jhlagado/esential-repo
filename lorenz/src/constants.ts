import { rand } from "./utils";
import { Vector } from "./vector";

export const cameraSpeed = 0.05;
export const LORENZ_SIGMA = 10;
export const LORENZ_RHO = 28;
export const LORENZ_BETA = 8 / 3;
export const LORENZ_DELTA = 0.01;
export const LORENZ_POS_INITIAL = new Vector(rand(10), rand(10), rand(10));
