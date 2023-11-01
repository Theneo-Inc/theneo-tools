import { Command, Option } from 'commander';
import { getProfile } from '../../context/auth';
import { input } from '@inquirer/prompts';
import { createSpinner, Spinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import {
  UserRole,
  DescriptionGenerationType,
  CreateProjectOptions,
  Theneo,
} from '@theneo/sdk';
import {
  getDescriptionGenerationType,
  getShouldBePublic,
} from '../../core/cli/project/create';
import {
  CreateCommandOptions,
  createFileOption,
  createLinkOption,
  getDescriptionGenerationOption,
  getImportSource,
  getPostmanApiKeyOption,
  getPostmanCollectionsOption,
  ImportOptionsEnum,
} from '../../core/cli/project';
import { getWorkspace } from '../../core/cli/workspace';
import { Profile } from '../../config';
import { getShouldPublish } from '../../core/cli/project/project';
import { tryCatch } from '../../utils/exception';

function getProjectName(options: CreateCommandOptions) {
  return (
    options.name ??
    input({
      message: 'Project Name:',
      validate: value => {
        if (value.length === 0) return 'Name is required!';
        return true;
      },
    })
  );
}

export function initProjectCreateCommand() {
  return new Command('create')
    .description('Create new project')
    .option('--name <name>', 'Project name')
    .option(
      '--workspace <workspace>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
    .addOption(
      createFileOption().conflicts([
        'link',
        'postmanApiKey',
        'postmanCollection',
        'empty',
        'sample',
      ])
    )
    .addOption(
      createLinkOption().conflicts([
        'postmanApiKey',
        'postmanCollection',
        'empty',
        'sample',
      ])
    )
    .addOption(getPostmanApiKeyOption().conflicts(['empty', 'sample']))
    .addOption(getPostmanCollectionsOption().conflicts(['empty', 'sample']))
    .addOption(
      new Option('--empty', 'Creates empty project')
        .conflicts(['sample'])
        .default(false)
    )
    .addOption(
      new Option('--sample', 'Creates project with sample template').default(
        false
      )
    )
    .option('--publish', 'Publish the project after creation', false)
    .option(
      '--public',
      'Make published documentation to be publicly accessible. Private by default',
      false
    )
    .option(
      '--export-dir <directory>',
      'Directory location where the files will be exported',
      false
    )
    .option(
      '--source-dir <directory>',
      'Directory location where the files will be imported from',
      false
    )

    .addOption(getDescriptionGenerationOption())
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      tryCatch(async (options: CreateCommandOptions) => {
        validateOptions(options);
        const isInteractive = options.name === undefined;

        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const spinner = createSpinner();
        const workspacesPromise = theneo.listWorkspaces(UserRole.EDITOR);
        const projectName = await getProjectName(options);

        spinner.start();
        const workspacesResult = await workspacesPromise;
        if (workspacesResult.err) {
          spinner.error({ text: workspacesResult.error.message });
          process.exit(1);
        }
        spinner.reset();
        const workspace = await getWorkspace(
          workspacesResult.value,
          options.workspace,
          isInteractive
        );

        if (
          !options.file &&
          !options.link &&
          !options.empty &&
          !options.sample &&
          (!options.postmanApiKey ||
            !options.postmanCollection ||
            options.postmanCollection.length === 0)
        ) {
          const inputSource = await getImportSource([
            ImportOptionsEnum.FILE,
            ImportOptionsEnum.LINK,
            ImportOptionsEnum.POSTMAN,
            ImportOptionsEnum.EMPTY,
          ]);
          options = { ...options, ...inputSource };
        }

        const isPublic = await getShouldBePublic(options, isInteractive);
        const descriptionGeneration = await getDescriptionGenerationType(
          options,
          isInteractive
        );
        const shouldPublish = await getShouldPublish(options, isInteractive);
        spinner.start({ text: 'creating project' });
        const createOptions: CreateProjectOptions = {
          name: projectName,
          workspace: {
            id: workspace.workspaceId,
          },
          isPublic: isPublic,
          publish: shouldPublish,
          descriptionGenerationType: descriptionGeneration,
          sampleData: options.sample,
          // TODO handle empty flag properly
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
        };
        if (
          createOptions.descriptionGenerationType !==
          DescriptionGenerationType.NO_GENERATION
        ) {
          spinner.start({ text: 'Generating descriptions' });
          createOptions.progressUpdateHandler =
            generationProgressHandler(spinner);
        }
        await createProject(spinner, createOptions, theneo, profile);
      })
    );
}

function validateOptions(options: CreateCommandOptions) {
  if (options.name !== undefined && options.name.length === 0) {
    console.error('--name flag cannot be empty');
    process.exit(1);
  }
  if (options.workspace !== undefined && options.workspace.length === 0) {
    console.error('--workspace flag cannot be empty');
    process.exit(1);
  }
  if (options.file !== undefined && options.file.length === 0) {
    console.error('--file flag cannot be empty');
    process.exit(1);
  }
}

const generationProgressHandler =
  (spinner: Spinner) => (progressPercent: number) => {
    const progress = progressPercent
      ? `| ${String(progressPercent).substring(0, 2)}%`
      : '';
    spinner.update({
      text: `Generating descriptions ${progress}`,
    });
  };

async function createProject(
  spinner: Spinner,
  options: CreateProjectOptions,
  theneo: Theneo,
  profile: Profile
) {
  const res = await theneo.createProject(options);
  if (res.err) {
    spinner.error({ text: res.error.message });
    process.exit(1);
  }
  if (res.value.publishData?.publishedPageUrl) {
    spinner.success({
      text: `Project published successfully! Published Page: ${res.value.publishData.publishedPageUrl}`,
    });
  } else {
    const editorLink = `${profile.appUrl}/editor/${res.value.projectId}`;
    spinner.success({
      text: `Project created, you can make changes via editor before publishing. Editor link: ${editorLink}`,
    });
  }
}
