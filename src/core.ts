import { Module, i32, i64, f32, f64 } from 'binaryen';

const module = new Module();

export const prims = {
  [i32]: module.i32,
  [i64]: module.i64,
  [f32]: module.f32,
  [f64]: module.f64,
};

export const { tuple, local, call } = module;
