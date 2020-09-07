import { Module } from 'binaryen';
import { asObject } from './utils';

const module = new Module();

const { i32, i64, f32, f64 } = module;
export const ops = { i32, i64, f32, f64 };
// export const xi32 = {
//   i32: asObject(Object.entries(i32).map(entry => entry))
// };

export const { tuple, local, call } = module;
