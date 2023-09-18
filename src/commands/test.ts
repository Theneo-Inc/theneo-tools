import { program } from './base';

program
  .name('test')
  .option('-d, --debug', 'enables verbose logging', false)
  .action(console.log);
