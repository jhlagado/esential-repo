import { Module, createType, ExpressionRef, Type, i32 } from 'binaryen';
import { ModuleDef, Accessor } from './types';

export const asArray = (arg: any) => (Array.isArray(arg) ? arg : [arg]);

export const makeModule = (
  defsFunc: ModuleDef,
  exported: string[] = [],
  start?: string,
): Module => {
  const m = new Module();
  m.setFeatures(512); // Features.Multivalue has a bug
  for (const [defName, def] of Object.entries(defsFunc(m))) {
    const [types, body] = def;
    const [arg, result, locals] = types;

    const accessors: Accessor[] = [
      ...Object.values(asArray(arg)),
      ...Object.values(locals),
    ].map((typ: Type, index: number) => (value?: ExpressionRef) =>
      value !== undefined ? m.local.set(index, value) : m.local.get(index, typ),
    );

    m.addFunction(
      defName,
      createType(asArray(arg)),
      createType(asArray(result)),
      locals,
      m.block(null as any, body(accessors)),
    );

    if (exported.includes(defName)) {
      m.addFunctionExport(defName, defName);
    }
  }
  if (start) {
    m.setStart(m.getFunction(start));
  }
  return m;
};
