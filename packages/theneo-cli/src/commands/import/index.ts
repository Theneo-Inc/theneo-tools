import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';

export function initImportCommand(program: Command): Command {
  return program
    .command('import')
    .description("Export theneo's project in your local environment")
    .option('--key <project-key>', 'project key')
    .option('--dir <directory>', 'Generated theneo project directory')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        key: string | undefined;
        profile: string | undefined;
        dir: string;
      }) => {
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, options);

        await theneo.exportProject({
          projectId: project.id,
        });
      }
    );
}
