import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { tryCatch } from '../../utils/exception';

export function initProjectVersionDeleteCommand(): Command {
  return new Command('delete')
    .requiredOption('--versionId <versionId>', 'version id to delete')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      tryCatch(
        async (options: { versionId: string; profile: string | undefined }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);

          const deleteResult = await theneo.deleteProjectVersion(
            options.versionId
          );

          if (deleteResult.err) {
            console.error(deleteResult.error.message);
            process.exit(1);
          }
          console.log('Version deleted successfully!');
        }
      )
    );
}
