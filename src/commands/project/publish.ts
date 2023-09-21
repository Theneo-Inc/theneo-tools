import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { getProject } from './common';
import { publishProject } from '../../api/project';
import { createSpinner } from 'nanospinner';

export function initProjectPublishCommand() {
  return new Command('publish')
    .description('Publish project')
    .option('--project <project>', 'project key to delete')
    .action(async (options: { project: string | undefined }) => {
      const profile = getProfile().unwrap();
      const spinner = createSpinner('publishing project').start();
      const project = await getProject(profile, options);
      const publishResult = await publishProject(
        profile.apiUrl,
        profile.token,
        project.id
      );
      if (publishResult.err) {
        console.error(publishResult.val.message);
        process.exit(1);
      }
      spinner.success({
        text: `project published successfully! link: ${profile.appUrl}/${publishResult.val.companySlug}/${publishResult.val.projectKey}`,
      });
    });
}
