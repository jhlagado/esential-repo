import { Module } from 'binaryen';
import { opsSignatures } from './ops-sigs';
import { literalize } from './literals';
import { Dict, OpUtils, TypeDef } from './types';
import { asArray, isSignature } from './util';
import { setTypeDef } from './type-util';

const builtinCallableMap = new Map<string, any>();

export const builtinCallable = (
  module: Module,
  func: Function,
  paramTypeDefs: Dict<TypeDef> | TypeDef[],
  resultTypeDef: TypeDef,
): Function => {
  return (...params: any[]) => {
    const typeArray = asArray(paramTypeDefs);
    const params1 = params.map((param, index) => literalize(module, param, typeArray[index]));
    const expr = func(...params1);
    setTypeDef(expr, resultTypeDef);
    return expr;
  };
};

export const builtinProxy = (
  module: Module,
  sigs: Dict<any>,
  moduleBase: any = module,
  path: string = '',
) =>
  new Proxy(sigs, {
    get(_target, name: string): any {
      let realName = name;
      let sig = sigs[realName];
      if (sig == null) {
        realName = `${name}_s`;
        sig = sigs[realName];
      }
      if (sig == null) {
        throw new Error(`No builtin with the name ${name}`);
      } else {
        const path1 = path + '.' + realName;
        if (isSignature(sig)) {
          if (builtinCallableMap.has(path1)) return builtinCallableMap.get(path1);
          const b = builtinCallable(module, moduleBase[realName], sig.params, sig.result);
          builtinCallableMap.set(path1, b);
          return b;
        } else {
          return builtinProxy(module, sigs[name], moduleBase[name], path1);
        }
      }
    },
  });

export const getBuiltinProxy = (module: Module, key: keyof Module) => {
  const sigs = opsSignatures[key];
  const base = module[key];
  return builtinProxy(module, sigs, base, key);
};

export const getOps = (module: Module): OpUtils => ({
  i32: getBuiltinProxy(module, 'i32'),
  i64: getBuiltinProxy(module, 'i64'),
  f32: getBuiltinProxy(module, 'f32'),
  f64: getBuiltinProxy(module, 'f64'),
  memory: getBuiltinProxy(module, 'memory'),
});
