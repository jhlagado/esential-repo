import { i32, Module, none } from 'binaryen';
import { asArray, isSignature, resolveAccessors, setTypeDef } from '.';
import { applyTypeDef } from './literals';
import { Dict, TypeDef } from './types';

export const builtin = (
  module: Module,
  func: Function,
  paramTypeDefs: Dict<TypeDef> | TypeDef[],
  resultTypeDef: TypeDef,
): Function => {
  return (...params: any[]) => {
    const typeArray = asArray(paramTypeDefs);
    const params1 = params.map((param, index) =>
      applyTypeDef(module, resolveAccessors(param), typeArray[index]),
    );
    const expr = func(...params1);
    setTypeDef(expr, resultTypeDef);
    return expr;
  };
};

export const builtinProxy = (module: Module, sigs: Dict<any>, moduleBase: any = module) =>
  new Proxy(sigs, {
    get(_target, name: string): any {
      const sig = sigs[name];
      if (sig == null) {
        throw new Error(`No builtin with the name ${name}`);
      } else if (isSignature(sig)) {
        return builtin(module, moduleBase[name], sig.params, sig.result);
      } else {
        return builtinProxy(module, sigs[name], moduleBase[name]);
      }
    },
  });

export const getBuiltin = (module: Module) =>
  builtinProxy(module, {
    i32: {
      add: { params: { a: i32, b: i32 }, result: i32 },
      lt_u: { params: { a: i32, b: i32 }, result: i32 },
      rem_u: { params: { a: i32, b: i32 }, result: i32 },
      eqz: { params: { a: i32 }, result: i32 },
      sub: { params: { a: i32, b: i32 }, result: i32 },
      gt_s: { params: { a: i32, b: i32 }, result: i32 },
      load: { params: { offset: none, align: none, ptr: i32, value: i32 }, result: i32 },
      store: { params: { offset: none, align: none, ptr: i32 }, result: i32 },
    },
  });
