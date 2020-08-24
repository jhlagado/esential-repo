import { Module, createType, ExpressionRef, Type } from 'binaryen';
import { AccessorMaker, ModuleDef } from './types';

export const makeAccessor: AccessorMaker = (mod: Module, index: number, typ: Type) => (
  value?: ExpressionRef,
) => {
  if (typeof value !== 'undefined') {
    return mod.local.set(index, value);
  } else {
    return mod.local.get(index, typ);
  }
};

export const makeModule = (
  defsFunc: ModuleDef,
  exports: string[] = [],
  start?: string,
): Module => {
  const m = new Module();
  m.setFeatures(512); // Features.Multivalue has a bug
  for (const [defName, def] of Object.entries(defsFunc(m))) {
    const [types, body] = def;

    const [arg, result, locals] = types;
    const args = Array.isArray(arg) ? arg : [arg];
    const results = Array.isArray(result) ? result : [result];

    const accessors = [
      ...Object.values(args),
      ...Object.values(locals),
    ].map((typ: Type, index: number) => makeAccessor(m, index, typ));

    m.addFunction(
      defName,
      createType(args),
      createType(results),
      locals,
      m.block(null as any, body(accessors)),
    );

    if (exports.includes(defName)) {
      m.addFunctionExport(defName, defName);
    }
  }
  if (start) {
    m.setStart(m.getFunction(start));
  }
  return m;
};

