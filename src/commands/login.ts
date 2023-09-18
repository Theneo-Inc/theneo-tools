import { program } from './base';

program
  .command('run <exercise>')
  .alias('exercise <exercise>')
  .description('Runs an exercise on watch mode')
  .option('-s, --solution', 'Run the solution')
  .action(
    (
      exercise: string,
      options: {
        solution: boolean;
      }
    ) => console.log(exercise, options.solution)
  );

program
  .command('prepare-stackblitz')
  .description('Adds e-01, e-02 scripts to package.json')
  .action(console.log);
