import { Command } from 'commander';

export function initProjectVersionDeleteCommand(): Command {
  return new Command('delete')
    .option('--versionId <versionId>', 'version id to delete')
    .action((options: { versionId: string | undefined }) => {
      console.log('deleting version', options);
    });
}
