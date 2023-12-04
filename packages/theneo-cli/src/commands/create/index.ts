import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';

export function initCreateCommand(program: Command): Command {
  return program
    .command('create', { hidden: true })
    .requiredOption(
      '--dir <directory>',
      'directory location where the project will be exported'
    )
    .requiredOption('--name <project-name>', 'project key')
    .option(
      '--workspace <workspace>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        name: string;
        workspace: string | undefined;
        dir: string;
        profile: string | undefined;
      }) => {
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);

        const res = await theneo.createProject({
          name: options.name || 'test',
          data: {
            directory: options.dir,
          },
        });
        if (res.err) {
          console.error(res.error.message);
          process.exit(1);
        } else {
          // TODO return correct type from sdk
          // @ts-ignore
          const projectId = String(res.value.project?.id || '');
          const previewProjectLink = theneo.getPreviewProjectLink(projectId);
          console.log(previewProjectLink);
        }
      }
    );
}
