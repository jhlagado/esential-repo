import {
  ExternalDef,
  Callable,
  updateFunc,
} from './types';
import { none, createType, ExpressionRef, Module } from 'binaryen';
import { asType } from './utils';
import { getCallable } from './vars';

export const getExternalFunc = (
  module: Module,
  callableIdMap: Map<Callable, string>,
  updateImports: (fn: updateFunc<any>) => void,
) => (def: ExternalDef, fn: Function): Callable => {
  const count = callableIdMap.size;
  const {
    namespace = 'namespace',
    name = 'name',
    id = `external${count}`,
    params: paramDefs = {},
    result: resultDef = none,
  } = def;
  const paramsType = createType(Object.values(paramDefs).map(asType));
  const resultType = asType(resultDef);
  module.addFunctionImport(id, namespace, name, paramsType, resultType);
  updateImports((imports: any) => ({
    ...imports,
    [namespace]: {
      ...imports[namespace],
      [name]: fn,
    },
  }));
  const exprFunc = (...params: ExpressionRef[]) =>
  module.call(id, params, resultType);
  return getCallable(id, false, exprFunc, resultDef, callableIdMap);

};
