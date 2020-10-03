import { ExpressionRef, auto, getExpressionType } from 'binaryen';
import { asLiteral, literalize } from './literals';
import { getModule } from './module';
import { getTypeDef, setTypeDef } from './type-util';
import { Expression } from './types';

const lit = (expression: Expression) => literalize(expression);

let scopeCount = 0;

export const FOR = (initializer: ExpressionRef, condition: ExpressionRef, final: ExpressionRef) => (
  ...body: ExpressionRef[]
) => {
  const scopeId = scopeCount++;
  const module = getModule();
  const {
    i32: { ne },
  } = module;
  const expr = module.block(
    null as any,
    [
      literalize(initializer),
      module.block(`loopOuter${scopeId}`, [
        module.loop(
          `loop${scopeId}`,
          module.block(null as any, [
            //
            module.br(`loopOuter${scopeId}`, ne(condition, asLiteral(1))),
            module.block(
              null as any,
              body.map(expression => literalize(expression)),
            ),
            literalize(final),
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
export const IF = (condition: ExpressionRef) => (...thenBody: Expression[]) => (
  ...elseBody: Expression[]
) => {
  const module = getModule();
  const expr = module.if(
    condition,
    module.block(
      null as any,
      thenBody.map(lit),
      auto,
    ),
    module.block(
      null as any,
      elseBody.map(lit),
      auto,
    ),
  );
  const type = getExpressionType(expr);
  const typeDef = getTypeDef(type);
  setTypeDef(expr, typeDef);
  return expr;
};

export const block = (...args: Expression[]) => {
  const module = getModule();
  const expr = module.block(
    null as any,
    args.map(lit),
    auto,
  );
  setTypeDef(expr, getExpressionType(expr));
  return expr;
};
