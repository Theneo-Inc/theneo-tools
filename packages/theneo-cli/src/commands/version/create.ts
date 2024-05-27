import { Command } from 'commander';

export function initProjectVersionCreateCommand(): Command {
  return new Command('create')
    .option('--name <name>', 'Name of the version')
    .option('--default', 'Set the version as default')
    .action(
      (options: { name: string | undefined; default: boolean | undefined }) => {
        console.log('Creating version', options);
      }
    );
}
