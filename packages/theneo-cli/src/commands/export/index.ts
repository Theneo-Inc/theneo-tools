import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';

export function initExportCommand(program: Command): Command {
  return program
    .command('export', { hidden: true })
    .option('--key <project-slug>', 'project slug - deprecated')
    .option('--project <project-slug>', 'project slug')
    .option(
      '--workspace <workspace-slug>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
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
        project: string | undefined;
        workspace: string | undefined;
        profile: string | undefined;
        dir: string;
      }) => {
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, {
          projectKey: options.key || options.project,
          workspaceKey: options.workspace,
        });

        const res = await theneo.exportProject({
          projectId: project.id,
          dir: options.dir,
        });

        if (res.err) {
          console.error(res.error.message);
          process.exit(1);
        }
      }
    );
}
