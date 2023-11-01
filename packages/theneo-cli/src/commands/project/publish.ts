import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createSpinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';
import { tryCatch } from '../../utils/exception';

export function initProjectPublishCommand() {
  return new Command('publish')
    .description('Publish project')
    .option('--key <project-key>', 'project key to publish')
    .option('--workspace <workspace-key>', 'Workspace key')
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
      )
    );
}
