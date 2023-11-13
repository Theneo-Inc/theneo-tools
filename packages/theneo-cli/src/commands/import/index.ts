import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';

export function initImportCommand(program: Command): Command {
  return program
    .command('import', { hidden: true })
    .option('--key <project-key>', 'project key')
    .option(
      '--workspace <workspace>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
    .option('--dir <directory>', 'Generated theneo project directory')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        key: string | undefined;
        workspace: string | undefined;
        profile: string | undefined;
        dir: string;
      }) => {
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, {
          projectKey: options.key,
          workspaceKey: options.workspace,
        });

        await theneo.exportProject({
          projectId: project.id,
        });
      }
    );
}
