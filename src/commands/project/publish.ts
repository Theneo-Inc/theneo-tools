import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { getProject } from './common';
import { createSpinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';

export function initProjectPublishCommand() {
  return new Command('publish')
    .description('Publish project')
    .option('--project <project>', 'project key to delete')
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
        const theneo = createTheneo(profile);
        const spinner = createSpinner('publishing project').start();
        const project = await getProject(theneo, options);
        const publishResult = await theneo.publishProjectById(project.id);
        if (publishResult.err) {
          console.error(publishResult.error.message);
          process.exit(1);
        }
        spinner.success({
          text: `project published successfully! Published Page: ${profile.appUrl}/${publishResult.value.companySlug}/${publishResult.value.projectKey}`,
        });
      }
    );
}
