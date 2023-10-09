// "${process.env.APP_DOMAIN}/preview/${projectId}?github=${TheneoToken}"

import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { createSpinner } from 'nanospinner';
import { getProject } from '../../core/cli/project/project';

export function initProjectPreviewCommand() {
  return new Command('preview')
    .description(
      'Preview project, this command is used to validate published page before actually publishing it'
    )
    .option('--key <project-key>', 'project key to preview')
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
        const spinner = createSpinner('Creating preview').start();
        const publishResult = await theneo.previewProject(project.id);
        if (publishResult.err) {
          console.error(publishResult.error);
          process.exit(1);
        }
        // TODO change parameter name
        const link = `${profile.appUrl}/preview/${project.id}?github=${profile.token}`;
        spinner.success({
          text: `project preview created successfully! Page: ${link}`,
        });
      }
    );
}
