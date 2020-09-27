import { ExpressionRef, auto, Module, getExpressionType } from 'binaryen';
import { getBlock } from './func-util';
import { asLiteral } from './literals';
import { setTypeDef } from './type-util';
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
  console.log({ initializer, condition, final });
  return module.block(
    null as any,
    [
      initializer,
      module.block(`loopOuter${scopeId}`, [
        module.loop(
          `loop${scopeId}`,
          module.block(null as any, [
            //
            module.br(`loopOuter${scopeId}`, ne(condition, asLiteral(module, 1))),
            ...body,
            final,
            module.br(`loop${scopeId}`),
          ]),
        ),
      ]),
    ],
    auto,
  );
};

//TODO make this a first class expression
export const getIF = (module: Module) => (condition: ExpressionRef) => (
  ...thenBody: Expression[]
) => (...elseBody: Expression[]) => {
  return module.if(
    condition,
    module.block(null as any, thenBody.map(resolveExpression)),
    module.block(null as any, elseBody.map(resolveExpression)),
  );
};
