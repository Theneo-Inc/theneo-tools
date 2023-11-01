import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';

export function initCreateCommand(program: Command): Command {
  return program
    .command('create')
    .option('--name <project-name>', 'project key')
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
        name: string | undefined;
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

        console.log(JSON.stringify(res));
      }
    );
}
