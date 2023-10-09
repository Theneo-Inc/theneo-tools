import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createSpinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';

export function initProjectPublishCommand() {
  return new Command('publish')
    .description('Publish project')
    .option('--key <project-key>', 'project key to publish')
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
        const spinner = createSpinner('Publishing project').start();
        const publishResult = await theneo.publishProject(project.id);
        if (publishResult.err) {
          console.error(publishResult.error.message);
          process.exit(1);
        }
        spinner.success({
          text: `project published successfully! Published Page: ${publishResult.value.publishedPageUrl}`,
        });
      }
    );
}
