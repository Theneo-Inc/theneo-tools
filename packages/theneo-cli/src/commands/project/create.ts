import { Command } from 'commander';
import { getProfile } from '../../context/auth';

import { input } from '@inquirer/prompts';
import { createSpinner, Spinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import { UserRole, DescriptionGenerationType } from '@theneo/sdk';
import {
  getDescriptionGenerationType,
  getDocumentationFileLocation,
  getShouldBePublic,
} from '../../core/cli/project/create';
import {
  CreateCommandOptions,
  getDescriptionGenerationOption,
} from '../../core/cli/project';
import { getWorkspace } from '../../core/cli/workspace';
import { CreateProjectOptions } from '@theneo/sdk';
import { Theneo } from '@theneo/sdk';
import { Profile } from '../../config';
import { getShouldPublish } from '../../core/cli/project/project';

export function initProjectCreateCommand() {
  return new Command('create')
    .description('Create new project')
    .option('--name <name>', 'Project name')
    .option(
      '--workspace <workspace>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
    .option(
      '-f, --file <file>',
      'API file path to import (eg: docs/openapi.yml)'
    )
    .option('--link <link>', 'API file URL to import')
    .option('--sample', 'Creates project with sample data', false)
    .option('--publish', 'Publish the project after creation', false)
    .option(
      '--public',
      'Make published documentation to be publicly accessible. Private by default',
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

      const spinner = createSpinner();
      if (!isInteractive) {
        spinner.start({ text: 'creating project' });
        const createOptions: CreateProjectOptions = {
          name: options.name ?? '',
          workspace: {
            key: options.workspace,
          },
          isPublic: options.public,
          publish: options.publish,
          descriptionGenerationType: options.generateDescription,
          sampleData: options.sample,
          data: {
            file: options.file,
            link: options.link ? new URL(options.link) : undefined,
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
        return;
      }

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
        data: {
          file: absoluteFilePath,
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
    });
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
