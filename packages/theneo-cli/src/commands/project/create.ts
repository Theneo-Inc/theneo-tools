import { Command } from 'commander';
import { getProfile } from '../../context/auth';

import { readFile } from 'fs/promises';
import { input } from '@inquirer/prompts';
import { createSpinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import { UserRole, DescriptionGenerationType } from '@theneo/sdk';
import {
  getDescriptionGenerationOption,
  getDescriptionGenerationType,
  getDocumentationFileLocation,
  getShouldBePublic,
  getShouldPublish,
  waitForDescriptionGeneration,
} from '../../core/cli/project/create';
import { CreateCommandOptions } from '../../core/cli/project';
import { getWorkspace } from '../../core/cli/workspace';

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
        const publishedPageLink = ` ${profile.appUrl}/${publishResult.value.companySlug}/${publishResult.value.projectKey}`;

        spinner.success({
          text: `Project published successfully! Published Page:${publishedPageLink}`,
        });
      } else {
        const editorLink = `${profile.appUrl}/editor/${projectId}`;
        console.log(
          `Project created, you can make changes via editor before publishing. Editor link: ${editorLink}`
        );
      }
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
