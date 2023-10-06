import { Command, Option } from 'commander';
import { getProfile } from '../../context/auth';

import { readFile } from 'fs/promises';
import { checkDocumentationFile, getAbsoluteFilePath } from '../../utils/file';
import { input, select, confirm } from '@inquirer/prompts';
import { createSpinner, Spinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import { sleep } from '../../utils';
import {
  Theneo,
  CreatedProjectStatusEnum,
  UserRole,
  Workspace,
  DescriptionGenerationType,
} from '@theneo/sdk';

async function getDocumentationFileLocation(options: CreateCommandOptions) {
  const specFileName =
    options.file ??
    (await input({
      message: 'API file path to import (eg: docs/openapi.yml) :',
      validate: value => {
        if (value.length === 0) return 'File is required!';
        return true;
      },
    }));

  const absoluteFilePath = getAbsoluteFilePath(specFileName);
  const isValidRes = await checkDocumentationFile(absoluteFilePath);
  if (isValidRes.err) {
    console.error(isValidRes.error);
    process.exit(1);
  }
  return absoluteFilePath;
}

async function getShouldBePublic(
  options: CreateCommandOptions,
  isInteractive: boolean
): Promise<boolean> {
  if (isInteractive) {
    return confirm({
      message: 'Documentation should be public?',
      default: false,
    });
  }
  return options.publish;
}

interface CreateCommandOptions {
  name: string | undefined;
  workspace: string | undefined;
  file: string | undefined;
  publish: boolean;
  public: boolean;
  generateDescription: DescriptionGenerationType;
  profile: string | undefined;
}

async function getDescriptionGenerationType(
  options: CreateCommandOptions,
  isInteractive: boolean
): Promise<DescriptionGenerationType> {
  if (isInteractive) {
    return select<DescriptionGenerationType>({
      message: 'Select description generation option type with AI',
      choices: [
        {
          name: "Don't generate descriptions",
          value: DescriptionGenerationType.NO_GENERATION,
        },
        {
          name: 'Fill empty descriptions',
          value: DescriptionGenerationType.FILl,
        },
        {
          name: 'Overwrite descriptions',
          value: DescriptionGenerationType.OVERWRITE,
        },
      ],
    });
  }
  return options.generateDescription;
}

function getDescriptionGenerationOption() {
  return new Option(
    '--generate-description',
    'Indicates if AI should be used for description generation'
  )
    .default('no')
    .choices(['fill-empty', 'overwrite-all', 'no'])
    .argParser((value, previous) => {
      if (value === 'fill-empty') {
        return DescriptionGenerationType.FILl;
      }
      if (value === 'overwrite-all') {
        return DescriptionGenerationType.OVERWRITE;
      }
      if (value === 'no') {
        return DescriptionGenerationType.NO_GENERATION;
      }
      return previous;
    });
}

async function waitForDescriptionGeneration(
  theneo: Theneo,
  spinner: Spinner,
  projectId: string
): Promise<boolean> {
  spinner.reset();
  spinner.start({ text: 'Generating descriptions' });
  while (true) {
    const generateDescriptionsResult =
      await theneo.getDescriptionGenerationStatus(projectId);
    if (generateDescriptionsResult.err) {
      console.error(generateDescriptionsResult.error.message);
      process.exit(1);
    }
    if (
      generateDescriptionsResult.value.creationStatus ===
      CreatedProjectStatusEnum.Finished
    ) {
      spinner.success({ text: 'Description  generation finished' });
      return true;
    }
    if (
      generateDescriptionsResult.value.creationStatus ===
      CreatedProjectStatusEnum.Error
    ) {
      spinner.error({ text: 'Description Generation Errored' });
      return false;
    }
    const progress = generateDescriptionsResult.value
      .descriptionGenerationProgress
      ? `| ${String(
          generateDescriptionsResult.value.descriptionGenerationProgress
        ).substring(0, 2)}%`
      : '';
    spinner.update({
      text: 'Generating descriptions ' + progress,
    });
    await sleep(5000);
  }
}

export function initProjectCreateCommand() {
  return new Command('create')
    .description('Create new project')
    .option('--name <name>', 'Project name')
    .option(
      '--workspace <workspace>',
      'Enter workspace slug where the project should be created in'
    )
    .option(
      '-f, --file <file>',
      'API file path to import (eg: docs/openapi.yml)'
    )
    .option('--publish', 'Publish the project after creation', false)
    .option(
      '--public',
      'Make published documentation public, default private',
      false
    )

    .addOption(getDescriptionGenerationOption())
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(async (options: CreateCommandOptions) => {
      validateOptions(options);
      const isInteractive = options.name === undefined;

      const profile = getProfile(options.profile);
      const theneo = createTheneo(profile);
      const workspacesPromise = theneo.listWorkspaces(UserRole.EDITOR);

      const projectName =
        options.name ??
        (await input({
          message: 'Project Name:',
          validate: value => {
            if (value.length === 0) return 'Name is required!';
            return true;
          },
        }));
      const spinner = createSpinner().start();
      spinner.start();
      const workspacesResult = await workspacesPromise;
      spinner.reset();
      if (workspacesResult.err) {
        console.error(workspacesResult.error.message);
        process.exit(1);
      }
      const workspace = await getWorkspace(
        workspacesResult.value,
        options.workspace
      );
      const absoluteFilePath = await getDocumentationFileLocation(options);

      const isPublic = await getShouldBePublic(options, isInteractive);
      const descriptionGeneration = await getDescriptionGenerationType(
        options,
        isInteractive
      );

      spinner.start({ text: 'creating project' });
      const projectResult = await theneo.createProjectBase(
        projectName,
        workspace.workspaceId
      );
      if (projectResult.err) {
        console.error(projectResult.error.message);
        process.exit(1);
      }
      const file = await readFile(absoluteFilePath);
      const projectId = projectResult.value;
      const importResult = await theneo.importProjectDocument(projectId, file);
      if (importResult.err) {
        console.error(importResult.error.message);
        process.exit(1);
      }
      spinner.success({ text: 'project created successfully' });
      await theneo.completeProjectCreation(
        projectId,
        isPublic,
        descriptionGeneration
      );
      if (descriptionGeneration !== DescriptionGenerationType.NO_GENERATION) {
        await waitForDescriptionGeneration(theneo, spinner, projectId);
      }
      const shouldPublish = await getShouldPublish(options, isInteractive);
      if (shouldPublish) {
        spinner.reset();
        spinner.start({ text: 'Publishing project' });
        spinner.spin();
        const publishResult = await theneo.publishProjectById(projectId);
        if (publishResult.err) {
          console.error(publishResult.error.message);
          process.exit(1);
        }
        spinner.success({
          text: `Project published successfully! Published Page: ${profile.appUrl}/${publishResult.value.companySlug}/${publishResult.value.projectKey}`,
        });
      } else {
        console.log(
          `Project created, you can make changes via editor before publishing. Editor link: ${profile.appUrl}/editor/${projectId}`
        );
      }
    });
}

async function getWorkspace(
  workspaces: Workspace[],
  workspace: undefined | string
): Promise<Workspace> {
  if (workspaces.length === 0) {
    console.error('No workspaces found.');
    process.exit(1);
  }
  if (workspace) {
    const workspaceFound = workspaces.find(ws => ws.slug === workspace);
    if (workspaceFound) {
      return workspaceFound;
    }
    console.error(`Workspace ${workspace} not found.`);
    process.exit(1);
  }

  if (workspaces.length === 1) {
    const workspace = workspaces[0]!;
    console.info(`Using default workspace: ${workspace.name}`);
    return workspace;
  }

  return select({
    message: 'Pick a workspace.',
    choices: workspaces.map(ws => {
      if (ws.isDefault) {
        return { value: ws, name: ws.name, description: 'default' };
      }
      return { value: ws, name: ws.name };
    }),
  });
}

async function getShouldPublish(
  options: CreateCommandOptions,
  isInteractive: boolean
): Promise<boolean> {
  if (isInteractive) {
    return confirm({
      message: 'Want to publish the project?',
      default: true,
    });
  }
  return options.publish;
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
