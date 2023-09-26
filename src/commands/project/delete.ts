import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { deleteProject } from '../../api/requests/project';
import { getProject } from './common';

export function initProjectDeleteCommand() {
  return new Command('delete')
    .description('Delete project')
    .option('--project <project>', 'Project key')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        project: string | undefined;
        profile: string | undefined;
      }) => {
        const profile = getProfile(options.profile);
        const project = await getProject(profile, options);
        const projectsResult = await deleteProject(
          profile.apiUrl,
          profile.token,
          project.id
        );
        if (projectsResult.err) {
          console.error(projectsResult.error.message);
          process.exit(1);
        }
      }
    );
}
