import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject, getShouldPublish } from '../../core/cli/project/project';
import {
  createImportTypeOption,
  getImportOption,
} from '../../core/cli/project';
import { ImportOption } from '@theneo/sdk';
import { createSpinner } from 'nanospinner';

export function initImportCommand(program: Command): Command {
  return program
    .command('import', { hidden: true })
    .description('Update theneo project from generated markdown directory')
    .option('--key <project-key>', 'project key')
    .option(
      '--workspace <workspace>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
    .option('--dir <directory>', 'Generated theneo project directory')
    .option('--publish', 'Automatically publish the project', false)
    .addOption(createImportTypeOption())
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        key: string | undefined;
        workspace: string | undefined;
        importType: ImportOption | undefined;
        dir: string;
        publish: boolean;
        profile: string | undefined;
      }) => {
        const isInteractive = options.key === undefined;
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, {
          projectKey: options.key,
          workspaceKey: options.workspace,
        });

        const importOption: ImportOption = await getImportOption(
          options,
          isInteractive
        );
        const shouldPublish = await getShouldPublish(options, isInteractive);

        const spinner = createSpinner('Updating documentation').start();
        const res = await theneo.importProjectDocument({
          projectId: project.id,
          publish: shouldPublish,
          data: {
            directory: options.dir,
          },
          importOption: importOption,
        });

        if (res.err) {
          spinner.error({ text: res.error.message });
          process.exit(1);
        }
        if (res.value.publishData?.publishedPageUrl) {
          spinner.success({
            text: `Project published successfully! Published Page: ${res.value.publishData.publishedPageUrl}`,
          });
        } else {
          const editorLink = `${profile.appUrl}/editor/${project.id}`;
          spinner.success({
            text: `Project updated, you can make changes via editor before publishing. Editor link: ${editorLink}`,
          });
        }
      }
    );
}
