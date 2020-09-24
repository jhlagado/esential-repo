import { i32, Module, none } from 'binaryen';
import { asArray, isSignature, resolveAccessors, setTypeDef } from '.';
import { applyTypeDef } from './literals';
import { Dict, TypeDef } from './types';

export const builtinCallable = (
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
        const realName = sig.alt || name;
        return builtinCallable(module, moduleBase[realName], sig.params, sig.result);
      } else {
        return builtinProxy(module, sigs[name], moduleBase[name]);
      }
    },
  });

export const getBuiltin = (module: Module) =>
  builtinProxy(module, {
    i32: {
      add: { params: { a: i32, b: i32 }, result: i32 },
      eqz: { params: { a: i32 }, result: i32 },
      gt: { params: { a: i32, b: i32 }, result: i32, alt: 'gt_s' },
      load: { params: { offset: none, align: none, ptr: i32, value: i32 }, result: i32 },
      lt: { params: { a: i32, b: i32 }, result: i32, alt: 'lt_s' },
      rem: { params: { a: i32, b: i32 }, result: i32, alt: 'rem_s' },
      store: { params: { offset: none, align: none, ptr: i32 }, result: i32 },
      sub: { params: { a: i32, b: i32 }, result: i32 },
    },
  });
