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
import {
  ImportOption,
  ImportOptionAdditionalData,
  MergingStrategy,
} from '@theneo/sdk';
import { confirm } from '@inquirer/prompts';
import { isInteractiveFlow } from '../../utils';
import { createNewProjectVersion } from '../../core/cli/version/create';

async function getImportOptionAdditionalData(
  importOption: ImportOption,
  options: ImportCommandOptions,
  isInteractive: boolean
): Promise<ImportOptionAdditionalData | undefined> {
  if (isInteractive && importOption === ImportOption.MERGE) {
    if (options.keepOldParameterDescription === undefined) {
      options.keepOldParameterDescription = await confirm({
        message: 'Keep old parameter descriptions?',
      });
    }

    if (options.keepOldSectionDescription === undefined) {
      options.keepOldSectionDescription = await confirm({
        message: 'Keep old parameter descriptions?',
      });
    }
  }

  if (
    options.keepOldParameterDescription === undefined &&
    options.keepOldSectionDescription === undefined
  ) {
    return undefined;
  }

  return {
    parameterDescriptionMergeStrategy: options.keepOldParameterDescription
      ? MergingStrategy.KEEP_OLD
      : MergingStrategy.KEEP_NEW,
    sectionDescriptionMergeStrategy: options.keepOldSectionDescription
      ? MergingStrategy.KEEP_OLD
      : MergingStrategy.KEEP_NEW,
  };
}

export function initProjectImportCommand(): Command {
  return new Command('import')
    .description(
      `Import updated documentation into Theneo using file, link or postman collection

Note: Published document link has this pattern: https://app.theneo.io/<workspace-slug>/<project-slug>/<version-slug>`
    )
    .option(
      '--key <project-slug>',
      'Specify the project slug to import updated documentation in - deprecated'
    )
    .option(
      '--project <project-slug>',
      'Specify the project slug to import updated documentation in'
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
    .option(
      '--workspace <workspace-slug>',
      'Workspace slug, where the project is located'
    )
    .option(
      '--versionSlug <version-slug>',
      'Project version slug to import to, if not provided then default version will be used - deprecated'
    )
    .option(
      '--projectVersion <version-slug>',
      'Project version slug to import to, if not provided then default version will be used'
    )
    .option(
      '--keepOldParameterDescription',
      'Additional flag during merging import option, it will keep old parameter descriptions'
    )
    .option(
      '--keepOldSectionDescription',
      'Additional flag during merging import option, it will keep old section descriptions'
    )
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .option('--tab <tab-slug>', 'Import into specific tab only (optional)')
    .action(
      tryCatch(async (options: ImportCommandOptions) => {
        const isInteractive = isInteractiveFlow(options);
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, {
          projectKey: options.key || options.project,
          workspaceKey: options.workspace,
        });

        const projectVersionSlug =
          options.versionSlug || options.projectVersion;
        const projectVersion = await getProjectVersion(
          theneo,
          project,
          projectVersionSlug,
          isInteractive
        );
        const projectVersionId = await createNewProjectVersion(
          theneo,
          project.id,
          projectVersion,
          projectVersionSlug
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
        const importOptionAdditionalData:
          | ImportOptionAdditionalData
          | undefined = await getImportOptionAdditionalData(
          importOption,
          options,
          isInteractive
        );
        const shouldPublish = await getShouldPublish(options, isInteractive);

        const spinner = createSpinner('Updating documentation').start();
        const res = await theneo.importProjectDocument({
          projectId: project.id,
          versionId: projectVersionId,
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
          importOptionAdditionalData,
          tabSlug: options.tab,
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
