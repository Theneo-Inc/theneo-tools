import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createSpinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import {
  getProject,
  getProjectVersion,
  getShouldPublish,
} from '../../core/cli/project/project';
import {
  createFileOption,
  createImportTypeOption,
  createLinkOption,
  getImportOption,
  getImportSource,
  getPostmanApiKeyOption,
  getPostmanCollectionsOption,
  ImportCommandOptions,
  ImportOptionsEnum,
} from '../../core/cli/project';
import { tryCatch } from '../../utils/exception';
import { ImportOption } from '@theneo/sdk';

export function initProjectImportCommand(): Command {
  return new Command('import')
    .description('Update theneo project with a updated API file')
    .option(
      '--key <project-key>',
      'Specify the project key to import updated documentation in'
    )
    .addOption(
      createFileOption().conflicts([
        'link',
        'postmanApiKey',
        'postmanCollection',
      ])
    )
    .addOption(
      createLinkOption().conflicts(['postmanApiKey', 'postmanCollection'])
    )
    .addOption(getPostmanApiKeyOption())
    .addOption(getPostmanCollectionsOption())
    .addOption(createImportTypeOption())
    .option('--publish', 'Automatically publish the project', false)
    .option('--workspace <workspace-key>', 'Workspace key')
    .option('--versionSlug <version>', 'Project version slug')
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      tryCatch(async (options: ImportCommandOptions) => {
        const isInteractive = options.key === undefined;
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, {
          projectKey: options.key,
          workspaceKey: options.workspace,
        });

        const projectVersion = await getProjectVersion(
          theneo,
          project,
          options.versionSlug
        );

        if (
          !options.file &&
          !options.link &&
          (!options.postmanApiKey ||
            !options.postmanCollection ||
            options.postmanCollection.length === 0)
        ) {
          const inputSource = await getImportSource([
            ImportOptionsEnum.FILE,
            ImportOptionsEnum.LINK,
            ImportOptionsEnum.POSTMAN,
          ]);
          options = { ...options, ...inputSource };
        }

        const importOption: ImportOption = await getImportOption(
          options,
          isInteractive
        );
        const shouldPublish = await getShouldPublish(options, isInteractive);

        const spinner = createSpinner('Updating documentation').start();
        const res = await theneo.importProjectDocument({
          projectId: project.id,
          versionId: projectVersion.id,
          publish: shouldPublish,
          data: {
            file: options.file,
            link: options.link ? new URL(options.link) : undefined,
            postman:
              options.postmanApiKey && options.postmanCollection
                ? {
                    apiKey: options.postmanApiKey,
                    collectionIds: options.postmanCollection,
                  }
                : undefined,
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
      })
    );
}
