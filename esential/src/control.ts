import { ExpressionRef, auto, Module, getExpressionType } from 'binaryen';
import { asLiteral, literalize } from './literals';
import { getTypeDef, setTypeDef } from './type-util';
import { Expression } from './types';
import { resolveExpression } from './util';

let scopeCount = 0;

export const getFOR = (module: Module) => (
  initializer: ExpressionRef,
  condition: ExpressionRef,
  final: ExpressionRef,
) => (...body: ExpressionRef[]) => {
  const scopeId = scopeCount++;
  const {
    i32: { ne },
  } = module;
  const expr = module.block(
    null as any,
    [
      literalize(module, initializer),
      module.block(`loopOuter${scopeId}`, [
        module.loop(
          `loop${scopeId}`,
          module.block(null as any, [
            //
            module.br(`loopOuter${scopeId}`, ne(condition, asLiteral(module, 1))),
            module.block(null as any,body.map(expression => literalize(module, expression))),
            literalize(module, final),
            module.br(`loop${scopeId}`),
          ]),
        ),
      ]),
    ],
    auto,
  );
  const type = getExpressionType(expr);
  const typeDef = getTypeDef(type);
  setTypeDef(expr, typeDef);
  return expr;
};

//TODO make this a first class expression
export const getIF = (module: Module) => (condition: ExpressionRef) => (
  ...thenBody: Expression[]
) => (...elseBody: Expression[]) => {
  const expr = module.if(
    condition,
    module.block(null as any, thenBody.map(expression => literalize(module, expression)), auto),
    module.block(null as any, elseBody.map(expression => literalize(module, expression)), auto),
  );
  const type = getExpressionType(expr);
  const typeDef = getTypeDef(type);
  setTypeDef(expr, typeDef);
  return expr;
};
