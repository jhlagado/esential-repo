import { Module } from 'binaryen';

const m = new Module();

export const {
  i32: i32ops,
  i64: i64ops,
  f32: f32ops,
  f64: f64ops,
  tuple,
  local,
  call,
} = m;
