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
import { isInteractiveFlow } from '../../utils';

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
    .option('--key <project-slug>', 'project key - deprecated')
    .option('--project <project-slug>', 'project slug')
    .option(
      '--workspace <workspace-slug>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
    .option('--dir <directory>', 'Generated theneo project directory')
    .option('--publish', 'Automatically publish the project', false)
    .option('--versionSlug <version>', 'Project version slug - deprecated')
    .option('--projectVersion <version-slug>', 'Version slug to publish')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        key: string | undefined;
        project: string | undefined;
        workspace: string | undefined;
        versionSlug: string | undefined;
        projectVersion: string | undefined;
        // importType: ImportOption | undefined;
        dir: string | undefined;
        publish: boolean;
        profile: string | undefined;
      }) => {
        const isInteractive = isInteractiveFlow(options);
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, {
          projectKey: options.key || options.project,
          workspaceKey: options.workspace,
        });
        const version = await getProjectVersion(
          theneo,
          project,
          options.versionSlug || options.projectVersion,
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
