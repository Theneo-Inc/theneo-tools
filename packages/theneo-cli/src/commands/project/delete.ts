import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';
import { tryCatch } from '../../utils/exception';

export function initProjectDeleteCommand(): Command {
  return new Command('delete')
    .description('Delete project')
    .option('--key <project-slug>', 'Project slug')
    .option('--workspace <workspace-slug>', 'Workspace slug')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      tryCatch(
        async (options: {
          key: string | undefined;
          workspace: string | undefined;
          profile: string | undefined;
        }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const project = await getProject(theneo, {
            projectKey: options.key,
            workspaceKey: options.workspace,
          });
          const projectsResult = await theneo.deleteProjectById(project.id);
          if (projectsResult.err) {
            console.error(projectsResult.error.message);
            process.exit(1);
          }
        }
      )
    );
}
