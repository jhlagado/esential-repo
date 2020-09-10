import { Module } from 'binaryen';

const module = new Module();

const { i32, i64, f32, f64 } = module;
export const ops = { i32, i64, f32, f64 };

export const { local } = module;
