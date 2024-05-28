import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import {
  getProject,
  getProjectVersion,
  getShouldPublish,
} from '../../core/cli/project/project';
import { getInputDirectoryLocation } from '../../core/cli/project';
import { ImportOption } from '@theneo/sdk';
import { createSpinner } from 'nanospinner';

function getDirectory(
  dir: string | undefined,
  isInteractive: boolean
): Promise<string> | string {
  if (dir) {
    return dir;
  }
  if (isInteractive) {
    return getInputDirectoryLocation();
  }
  throw new Error('Directory is required');
}

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
    .option('--versionSlug <version>', 'Project version slug')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        key: string | undefined;
        workspace: string | undefined;
        versionSlug: string | undefined;
        // importType: ImportOption | undefined;
        dir: string | undefined;
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
        const version = await getProjectVersion(
          theneo,
          project,
          options.versionSlug,
          isInteractive
        );

        const directory = await getDirectory(options.dir, isInteractive);
        // const importOption: ImportOption = await getImportOption(
        //   options,
        //   isInteractive
        // );
        const shouldPublish = await getShouldPublish(options, isInteractive);

        const spinner = createSpinner('Updating documentation').start();
        const res = await theneo.importProjectDocument({
          projectId: project.id,
          versionId: version?.id,
          publish: shouldPublish,
          data: {
            directory,
          },
          importOption: ImportOption.OVERWRITE,
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
