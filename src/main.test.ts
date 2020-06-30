import { compileAdder } from './main';

it('should', async done => {
  const importObject = {
    console: {
      log: function(arg: number) {
        console.log(arg);
        expect(arg).toBe(5);
        done();
      },
    },
  };
  const { addTwo } = await compileAdder(importObject);
  addTwo(3, 2);
});
