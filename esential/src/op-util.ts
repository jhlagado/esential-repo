import { Module } from 'binaryen';
import { opsSignatures } from './ops-sigs';
import { literalize } from './literals';
import { Dict, OpUtils, TypeDef } from './types';
import { asArray, isSignature } from './util';
import { setTypeDef } from './type-util';
import { getModule } from './module';

const builtinCallableMap = new Map<string, any>();

export const builtinCallable = (
  func: Function,
  paramTypeDefs: Dict<TypeDef> | TypeDef[],
  resultTypeDef: TypeDef,
): Function => {
  return (...params: any[]) => {
    const typeArray = asArray(paramTypeDefs);
    const params1 = params.map((param, index) => literalize(param, typeArray[index]));
    const expr = func(...params1);
    setTypeDef(expr, resultTypeDef);
    return expr;
  };
};

export const builtinProxy = (sigs: Dict<any>, moduleBase: any = module, path: string = '') =>
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
          const b = builtinCallable(moduleBase[realName], sig.params, sig.result);
          builtinCallableMap.set(path1, b);
          return b;
        } else {
          return builtinProxy(sigs[name], moduleBase[name], path1);
        }
      }
    },
  });

export const getBuiltinProxy = (key: keyof Module) => {
  const module = getModule();
  const sigs = opsSignatures[key];
  const base = module[key];
  return builtinProxy(sigs, base, key);
};

export const i32ops = getBuiltinProxy('i32');
export const i64ops = getBuiltinProxy('i64');
export const f32ops = getBuiltinProxy('f32');
export const f64ops = getBuiltinProxy('f64');
export const memops = getBuiltinProxy('memory');
