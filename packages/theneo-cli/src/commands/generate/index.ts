import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';

export function initExportCommand(program: Command): Command {
  return program
    .command('export')
    .description("Export theneo's project in your local environment")
    .option('--key <project-key>', 'project key')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .option(
      '--dir <directory>',
      'directory location where the project will be exported',
      'docs'
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
