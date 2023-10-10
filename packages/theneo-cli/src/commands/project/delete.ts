import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';

export function initProjectDeleteCommand() {
  return new Command('delete')
    .description('Delete project')
    .option('--key <project-key>', 'Project key')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        key: string | undefined;
        profile: string | undefined;
      }) => {
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, options);
        const projectsResult = await theneo.deleteProjectById(project.id);
        if (projectsResult.err) {
          console.error(projectsResult.error.message);
          process.exit(1);
        }
      }
    );
}
