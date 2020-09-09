import {
  ExternalDef,
  Callable,
  FuncDef,
  FuncImpl,
  VarDefs,
  Expression,
  IndirectInfo,
  updateFunc,
  TypeDef,
  Dict,
} from './types';
import { none, createType, ExpressionRef, auto, Module, Type } from 'binaryen';
import { asType, setTypeDef, getTypeDef, literal } from './utils';
import { getter, setter, getAssignable, inferTypeDef } from './vars';

export const getVarsProxy = (varDefs: Dict<TypeDef>, bodyItems: ExpressionRef[]) =>
  new Proxy(varDefs, {
    get: getter,
    set(varDefs: VarDefs, prop: string, expression: Expression) {
      const expr = setter(varDefs, prop, expression);
      bodyItems.push(expr);
      return true;
    },
  });

export const getResultFunc = (
  module: Module,
  resultDef: TypeDef,
  bodyItems: ExpressionRef[],
  updateResultDef: (typeDef: TypeDef) => void,
) => (...expressions: Expression[]) => {
  const exprs = expressions.map(getAssignable);
  const { length } = exprs;
  if (length === 0) {
    throw new Error(`Result function must have at least one arg`);
  }
  bodyItems.push(...exprs.slice(0, -1));
  const [expr] = exprs.slice(-1);
  if (resultDef === auto) {
    const typeDef = inferTypeDef(expr);
    if (typeDef == null) {
      throw new Error(`Couldn't infer ${expr}`);
    }
    updateResultDef(typeDef);
    setTypeDef(expr, typeDef);
  } else {
    const exprTypeDef = getTypeDef(expr);
    if (asType(exprTypeDef) != asType(resultDef)) {
      throw new Error(`Wrong return type, expected ${resultDef} and got ${exprTypeDef}`);
    }
  }
  bodyItems.push(module.return(expr));
};

const getBlockFunc = (module: Module) => (...expressions: Expression[]) => {
  const { length } = expressions;
  if (length === 0) {
    throw new Error(`Block must have at least one item`);
  }
  const exprs = expressions.map(getAssignable);
  const [lastExpr] = exprs.slice(-1);
  const lastTypeDef = getTypeDef(lastExpr);
  const blk = module.block(null as any, exprs, asType(lastTypeDef));
  setTypeDef(blk, lastTypeDef);
  return blk;
};

const getCallable = (
  id: string,
  exported: boolean,
  exprFunc: (...params: ExpressionRef[]) => ExpressionRef,
  resultDef: TypeDef,
  callableIdMap: Map<Callable, string>,
  exportedSet: Set<Callable>,
) => {
  const callable = (...params: ExpressionRef[]) => {
    const expr = exprFunc(...params);
    setTypeDef(expr, resultDef);
    return expr;
  };
  callableIdMap.set(callable, id);
  if (exported) {
    exportedSet.add(callable);
  }
  return callable;
};

export const funcFunc = (
  module: Module,
  callableIdMap: Map<Callable, string>,
  exportedSet: Set<Callable>,
) => (def: FuncDef, funcImpl: FuncImpl): Callable => {
  const count = callableIdMap.size;
  const {
    id = `func${count}`,
    params: paramDefs = {},
    result = auto,
    locals: localDefs = {},
    export: exported = true,
  } = def;
  const bodyItems: ExpressionRef[] = [];
  const varDefs = { ...paramDefs, ...localDefs };
  const varsProxy = getVarsProxy(varDefs, bodyItems);
  let resultDef = result;
  const resultFunc = getResultFunc(module, resultDef, bodyItems, (typeDef: TypeDef) => {
    resultDef = typeDef;
  });
  const blockFunc = getBlockFunc(module);
  funcImpl({ $: varsProxy, result: resultFunc, block: blockFunc });
  if (resultDef === auto) {
    resultDef = none;
  }
  const paramsType = createType(Object.values(paramDefs).map(asType));
  const localType = Object.values(varDefs)
    .slice(Object.values(paramDefs).length)
    .map(asType);
  const resultType = asType(resultDef);
  module.addFunction(id, paramsType, resultType, localType, module.block(null as any, bodyItems));

  const exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
  return getCallable(id, exported, exprFunc, resultDef, callableIdMap, exportedSet);
};

export const getFunc = (
  module: Module,
  callableIdMap: Map<Callable, string>,
  exportedSet: Set<Callable>,
  indirectTable?: IndirectInfo[],
) => (def: FuncDef, funcImpl: FuncImpl): Callable => {
  const count = callableIdMap.size;
  const {
    id = `indirect${count}`,
    params: paramDefs = {},
    result = auto,
    locals: localDefs = {},
    export: exported = true,
  } = def;
  const bodyItems: ExpressionRef[] = [];
  const varDefs = { ...paramDefs, ...localDefs };
  const varsProxy = getVarsProxy(varDefs, bodyItems);
  let resultDef = result;
  const resultFunc = getResultFunc(module, resultDef, bodyItems, (typeDef: TypeDef) => {
    resultDef = typeDef;
  });
  const blockFunc = getBlockFunc(module);
  funcImpl({ $: varsProxy, result: resultFunc, block: blockFunc });
  if (resultDef === auto) {
    resultDef = none;
  }
  const paramsType = createType(Object.values(paramDefs).map(asType));
  const localType = Object.values(varDefs)
    .slice(Object.values(paramDefs).length)
    .map(asType);

  const resultType = asType(resultDef);
  module.addFunction(id, paramsType, resultType, localType, module.block(null as any, bodyItems));

  let exprFunc;
  if (indirectTable == null) {
    exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
  } else {
    const { length: index } = indirectTable;
    indirectTable.push({ index, id, paramDefs, resultDef });
    exprFunc = (...params: ExpressionRef[]) =>
      module.call_indirect(literal(index), params, paramsType, resultType);
  }
  return getCallable(id, exported, exprFunc, resultDef, callableIdMap, exportedSet);
};

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
  const callable = (...params: ExpressionRef[]) => {
    const expr = module.call(id, params, resultType);
    setTypeDef(expr, resultDef);
    return expr;
  };
  callableIdMap.set(callable, id);
  updateImports((imports: any) => ({
    ...imports,
    [namespace]: {
      ...imports[namespace],
      [name]: fn,
    },
  }));
  return callable;
};

