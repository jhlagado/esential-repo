import { Module, createType, ExpressionRef } from 'binaryen';
import { ModuleDef, Accessor, TypeDef } from './types';

export const asArray = (arg: any) => (Array.isArray(arg) ? arg : [arg]);

export const makeModule = (
  defsFunc: ModuleDef,
  exported: string[] = [],
  start?: string,
): Module => {
  const m = new Module();
  m.setFeatures(512); // Features.Multivalue has a bug
  for (const [defName, def] of Object.entries(defsFunc(m))) {
    const [arg, result, locals, body] = def;

    const accessors0 = [
      ...Object.values(asArray(arg)),
      ...Object.values(locals),
    ];

    const accessors: Accessor[] = accessors0.map((typeDef: TypeDef, index: number) => {
      const typ = createType(asArray(typeDef));
      return (value?: ExpressionRef) =>
        value !== undefined
          ? m.local.set(index, value)
          : m.local.get(index, typ);
    });

    m.addFunction(
      defName,
      createType(asArray(arg)),
      createType(asArray(result)),
      locals.map(local => createType(asArray(local))),
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
