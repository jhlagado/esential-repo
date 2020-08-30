import { compileAdder } from './main-1';

it('should!', async done => {
  const importObject = {
    console: {
      log: function (arg: number) {
        console.log(arg);
        done();
      },
    },
  };
  console.log (process.argv);
  const { addTwo } = await compileAdder(importObject);
  const result = addTwo(3, 2);
  expect(result).toBe(5);
});
