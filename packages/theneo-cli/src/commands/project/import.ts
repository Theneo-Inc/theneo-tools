import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createSpinner, Spinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import chalk from 'chalk';
import {
  getProject,
  getProjectVersion,
  getShouldPublish,
} from '../../core/cli/project/project';
import {
  createDescriptionMergeStrategyOption,
  createFileOption,
  createImportTypeOption,
  createLinkOption,
  getImportOption,
  getImportSource,
  getPostmanApiKeyOption,
  getPostmanCollectionsOption,
  getDescriptionGenerationOption,
  ImportCommandOptions,
  ImportOptionsEnum,
} from '../../core/cli/project';
import { tryCatch } from '../../utils/exception';
import {
  ImportOption,
  ImportOptionAdditionalData,
  MergingStrategy,
  DescriptionGenerationType,
} from '@theneo/sdk';
import { confirm } from '@inquirer/prompts';
import { isInteractiveFlow } from '../../utils';
import { createNewProjectVersion } from '../../core/cli/version/create';

const MERGE_V2_IMPORT_OPTION = 'merge_v2';
const SPINNER_MESSAGE_MERGE_V2 =
  'Updating documentation (merge_v2 smart merge)...';

function isMergeV2Import(importOption: ImportOption): boolean {
  return String(importOption) === MERGE_V2_IMPORT_OPTION;
}

function getImportSpinnerText(
  options: ImportCommandOptions,
  importOption: ImportOption
): string {
  if (isMergeV2Import(importOption)) {
    return SPINNER_MESSAGE_MERGE_V2;
  }
  const importSource = options.file
    ? `file ${chalk.cyan(options.file)}`
    : options.link
      ? `link ${chalk.cyan(options.link)}`
      : 'Postman collection';
  return options.tab
    ? `Importing ${importSource} to tab ${chalk.cyan(options.tab)}...`
    : `Importing ${importSource}...`;
}

function handleProjectTabImportError(
  spinner: Spinner,
  coreMsg: string,
  tabSlug: string
): void {
  if (coreMsg.includes('no tabs') || coreMsg.includes('no tabs configured')) {
    spinner.error({
      text: chalk.red('✖ Project has no tabs configured'),
    });
    console.log(
      chalk.dim('\nTip:'),
      chalk.yellow('Import the full project first without --tab flag')
    );
    return;
  }
  const availableTabsMatch = coreMsg.match(/Available tabs:\s*([^\n"}\]]+)/);
  const availableTabs = availableTabsMatch?.[1]?.trim();
  const tabLabel = `'${tabSlug}'`;
  spinner.error({
    text: chalk.red(`✖ Tab ${chalk.yellow(tabLabel)} not found in project`),
  });
  if (availableTabs && availableTabs.length > 0) {
    console.log(chalk.dim('\nAvailable tabs:'), chalk.cyan(availableTabs));
  } else {
    console.log(
      chalk.dim('\nTip:'),
      chalk.yellow(
        'Import the full project first without --tab flag to create tabs'
      )
    );
  }
}

function handleProjectImportError(
  spinner: Spinner,
  errorMsg: string,
  tabSlug?: string
): void {
  // Strip stack trace lines (everything after the first newline) and common prefixes
  const coreMsg = (errorMsg.split('\n')[0] ?? errorMsg)
    .replace(/^"?(Error while importing markdown files:\s*)/i, '')
    .replace(/^Error:\s*/i, '')
    .replace(/^"|"$/g, '')
    .trim();

  if (
    tabSlug &&
    (coreMsg.includes('not found') || coreMsg.includes('no tabs'))
  ) {
    handleProjectTabImportError(spinner, coreMsg, tabSlug);
  } else if (
    coreMsg.toLowerCase().includes('unauthorized') ||
    coreMsg.includes('401')
  ) {
    spinner.error({
      text: chalk.red('✖ Unauthorized: invalid or expired API key'),
    });
    console.log(
      chalk.dim('\nRun:'),
      chalk.cyan('theneo login'),
      chalk.dim('to re-authenticate')
    );
  } else if (
    coreMsg.toLowerCase().includes('not found') ||
    coreMsg.includes('404')
  ) {
    spinner.error({ text: chalk.red(`✖ Resource not found: ${coreMsg}`) });
  } else if (
    coreMsg.toLowerCase().includes('permission') ||
    coreMsg.includes('403')
  ) {
    spinner.error({ text: chalk.red(`✖ ${coreMsg}`) });
  } else {
    spinner.error({ text: chalk.red(`✖ Import failed: ${coreMsg}`) });
  }
}

function handleProjectImportSuccess(
  spinner: Spinner,
  publishData: any,
  editorLink: string,
  tabSlug?: string
): void {
  if (publishData?.publishedPageUrl) {
    spinner.success({
      text: chalk.green('✔ Project published successfully!'),
    });
    console.log(
      chalk.dim('Published page:'),
      chalk.cyan(publishData.publishedPageUrl)
    );
  } else {
    const successMsg = tabSlug
      ? `✔ Tab ${chalk.cyan(tabSlug)} updated successfully!`
      : '✔ Project updated successfully!';

    spinner.success({
      text: chalk.green(successMsg),
    });
    console.log(chalk.dim('Editor link:'), chalk.cyan(editorLink));
  }
}

async function getDescriptionGenerationModeForImport(
  importOption: ImportOption,
  options: ImportCommandOptions,
  isInteractive: boolean
): Promise<DescriptionGenerationType> {
  // AI generation only available with overwrite import type
  if (importOption !== ImportOption.OVERWRITE) {
    return DescriptionGenerationType.NO_GENERATION;
  }

  // If user provided flag, use it (Casting to enum to fix TS2322)
  if (
    options.generateDescription &&
    options.generateDescription !== DescriptionGenerationType.NO_GENERATION
  ) {
    return options.generateDescription as DescriptionGenerationType;
  }

  // Interactive: ask user if import type is overwrite
  if (isInteractive && importOption === ImportOption.OVERWRITE) {
    const { select } = await import('@inquirer/prompts');
    return select<DescriptionGenerationType>({
      message: 'Select description generation option with AI',
      choices: [
        {
          name: "Don't generate descriptions",
          value: DescriptionGenerationType.NO_GENERATION,
        },
        {
          name: 'Fill empty descriptions',
          value: DescriptionGenerationType.FILl, // Kept your specific casing
        },
        {
          name: 'Overwrite descriptions',
          value: DescriptionGenerationType.OVERWRITE,
        },
      ],
    });
  }

  // Default: no generation (Casting fallback to fix TS2322)
  return (
    (options.generateDescription as DescriptionGenerationType) ||
    DescriptionGenerationType.NO_GENERATION
  );
}

async function getImportOptionAdditionalData(
  importOption: ImportOption,
  options: ImportCommandOptions,
  isInteractive: boolean
): Promise<ImportOptionAdditionalData | undefined> {
  if (importOption === ImportOption.MERGE_V2) {
    const strategy =
      options.descriptionMergeStrategy === 'keep_old'
        ? MergingStrategy.KEEP_OLD
        : MergingStrategy.KEEP_NEW;
    return {
      parameterDescriptionMergeStrategy: strategy,
      sectionDescriptionMergeStrategy: strategy,
    };
  }

  if (isInteractive && importOption === ImportOption.MERGE) {
    if (options.keepOldParameterDescription === undefined) {
      options.keepOldParameterDescription = await confirm({
        message: 'Keep old parameter descriptions?',
      });
    }

    if (options.keepOldSectionDescription === undefined) {
      options.keepOldSectionDescription = await confirm({
        message: 'Keep old section descriptions?',
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

async function validateAndGetImportSource(
  options: ImportCommandOptions
): Promise<void> {
  const hasNoSource =
    !options.file &&
    !options.link &&
    (!options.postmanApiKey ||
      !options.postmanCollection ||
      options.postmanCollection.length === 0);

  if (hasNoSource) {
    const inputSource = await getImportSource([
      ImportOptionsEnum.FILE,
      ImportOptionsEnum.LINK,
      ImportOptionsEnum.POSTMAN,
    ]);
    Object.assign(options, inputSource);
  }
}

function validateDescriptionGenerationOption(
  options: ImportCommandOptions,
  importOption: ImportOption
): void {
  const userRequestedAi =
    options.generateDescription &&
    options.generateDescription !== DescriptionGenerationType.NO_GENERATION;

  const isInvalidCombination =
    userRequestedAi && importOption !== ImportOption.OVERWRITE;

  if (isInvalidCombination) {
    console.error(
      chalk.red(
        '\nError: --generate-description requires --import-type overwrite'
      )
    );
    console.error(
      chalk.dim(
        'AI description generation is currently only supported with the overwrite import type.'
      )
    );
    process.exit(1);
  }
}

function createProgressUpdateHandler(
  generateDescription: DescriptionGenerationType,
  spinner: Spinner
): ((progressPercent: number) => void) | undefined {
  if (generateDescription === DescriptionGenerationType.NO_GENERATION) {
    return undefined;
  }

  return (progressPercent: number) => {
    const progress = progressPercent
      ? `| ${String(progressPercent).substring(0, 2)}%`
      : '';
    spinner.update({
      text: `Generating descriptions ${progress}`,
    });
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
    .addOption(createDescriptionMergeStrategyOption())
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
    .addOption(getDescriptionGenerationOption())
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
        await validateAndGetImportSource(options);

        const importOption: ImportOption = await getImportOption(
          options,
          isInteractive
        );

        // Validate user's explicit AI generation request before processing
        validateDescriptionGenerationOption(options, importOption);

        const generateDescription = await getDescriptionGenerationModeForImport(
          importOption,
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

        const spinner = createSpinner(
          getImportSpinnerText(options, importOption)
        ).start();

        if (generateDescription !== DescriptionGenerationType.NO_GENERATION) {
          spinner.update({ text: 'Generating descriptions' });
        }

        const progressUpdateHandler = createProgressUpdateHandler(
          generateDescription,
          spinner
        );

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
          importMetadata: {
            authorName: undefined,
          },
          tabSlug: options.tab,
          descriptionGenerationType: generateDescription,
          progressUpdateHandler,
        });

        if (res.err) {
          handleProjectImportError(spinner, res.error.message, options.tab);
          process.exit(1);
        }

        const editorLink = `${profile.appUrl}/editor/${project.id}`;
        handleProjectImportSuccess(
          spinner,
          res.value.publishData,
          editorLink,
          options.tab
        );
      })
    );
}
