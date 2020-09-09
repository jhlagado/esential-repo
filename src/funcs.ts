import {
  Callable,
  FuncDef,
  Initializer,
  Expression,
  IndirectInfo,
  TypeDef,
  VoidBlockFunc,
  BlockFunc,
  Ref,
} from './types';
import { none, createType, ExpressionRef, auto, Module } from 'binaryen';
import { asType, setTypeDef, getTypeDef, literal } from './utils';
import { getAssignable, inferTypeDef, getVarsProxy, getCallable } from './vars';

export const getExecFunc = (bodyItems: ExpressionRef[]): VoidBlockFunc => (
  ...expressions: Expression[]
) => {
  const exprs = expressions.map(getAssignable);
  const { length } = exprs;
  if (length === 0) {
    throw new Error(`Function must have at least one arg`);
  }
  bodyItems.push(...exprs);
};

export const getResultFunc = (
  module: Module,
  resultDefRef: Ref<TypeDef>,
  bodyItems: ExpressionRef[],
): VoidBlockFunc => (...expressions: Expression[]) => {
  const exprs = expressions.map(getAssignable);
  const { length } = exprs;
  if (length === 0) {
    throw new Error(`Result function must have at least one arg`);
  }
  bodyItems.push(...exprs.slice(0, -1));
  const [expr] = exprs.slice(-1);
  if (resultDefRef.current === auto) {
    const typeDef = inferTypeDef(expr);
    if (typeDef == null) {
      throw new Error(`Couldn't infer ${expr}`);
    }
    setTypeDef(expr, typeDef);
    resultDefRef.current = typeDef;
  } else {
    const exprTypeDef = getTypeDef(expr);
    if (asType(exprTypeDef) != asType(resultDefRef.current)) {
      throw new Error(`Wrong return type, expected ${resultDefRef} and got ${exprTypeDef}`);
    }
  }
  bodyItems.push(module.return(expr));
};

const getBlockFunc = (module: Module): BlockFunc => (...expressions: Expression[]) => {
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

export const getFunc = (
  module: Module,
  callableIdMap: Map<Callable, string>,
  exportedSet: Set<Callable>,
  indirectTable?: IndirectInfo[],
) => (def: FuncDef, initializer: Initializer): Callable => {
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
  const resultDefRef = { current: result };
  const resultFunc = getResultFunc(module, resultDefRef, bodyItems);
  const blockFunc = getBlockFunc(module);
  const execFunc = getExecFunc(bodyItems);
  initializer({ $: varsProxy, result: resultFunc, block: blockFunc, exec: execFunc });
  if (resultDefRef.current === auto) {
    resultDefRef.current = none;
  }
  const { length: paramsLength } = Object.values(paramDefs);
  const paramsType = createType(Object.values(paramDefs).map(asType));
  const resultType = asType(resultDefRef.current);
  const localTypes = Object.values(varDefs)
    .slice(paramsLength)
    .map(asType);
  module.addFunction(id, paramsType, resultType, localTypes, module.block(null as any, bodyItems));

  let exprFunc;
  if (indirectTable == null) {
    exprFunc = (...params: ExpressionRef[]) => module.call(id, params, resultType);
  } else {
    const { length: index } = indirectTable;
    indirectTable.push({ index, id, paramDefs, resultDef: resultDefRef.current });
    exprFunc = (...params: ExpressionRef[]) =>
      module.call_indirect(literal(index), params, paramsType, resultType);
  }
  return getCallable(id, exported, exprFunc, resultDefRef.current, callableIdMap, exportedSet);
};
