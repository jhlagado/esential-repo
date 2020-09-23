import { ExpressionRef, auto, Module } from 'binaryen';
import { getLiteral } from './literals';

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
            module.br(`loopOuter${scopeId}`, ne(condition, getLiteral(module, 1))),
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

export const getIF = (module: Module) => (condition: ExpressionRef) => (
  ...thenBody: ExpressionRef[]
) => (...elseBody: ExpressionRef[]) => {
  return module.if(
    condition,
    module.block(null as any, thenBody),
    module.block(null as any, elseBody),
  );
};
