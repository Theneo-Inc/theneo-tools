import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import {
  createProject,
  importProjectDocumentFile,
  publishProject,
} from '../../api/project';
import { queryUserWorkspaces } from '../../api/workspace';
import { Workspace } from '../../api/schema/workspace';
import { CreateProjectSchema } from '../../api/schema/project';
import { readFile } from 'fs/promises';
import { checkDocumentationFile, getAbsoluteFilePath } from '../../utils/file';
import { input, select, confirm } from '@inquirer/prompts';
import { createSpinner } from 'nanospinner';

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
    .option('--publish', 'Publish the project after creation')
    .option(
      '--noPublish',
      'Do not publish the project after creation, useful for pipeline'
    )
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        name: string | undefined;
        workspace: string | undefined;
        file: string | undefined;
        publish: boolean | undefined;
        noPublish: boolean | undefined;
        profile: string | undefined;
      }) => {
        validateOptions(options);

        const profile = getProfile(options.profile);
        const workspacesPromise = queryUserWorkspaces(
          profile.apiUrl,
          profile.token
        );
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
          console.error(workspacesResult.val.message);
          process.exit(1);
        }
        const workspace = await getWorkspace(
          workspacesResult.val,
          options.workspace
        );
        const specFileName =
          options.file ??
          (await input({
            message: 'API file path to import (eg: docs/openapi.yml) :',
            validate: value => {
              if (value.length === 0) return 'File is required!';
              return true;
            },
          }));

        spinner.start({ text: 'creating project' });
        const absoluteFilePath = getAbsoluteFilePath(specFileName);
        const isValidRes = await checkDocumentationFile(absoluteFilePath);
        if (isValidRes.err) {
          console.error(isValidRes.val);
          process.exit(1);
        }

        const requestData = getCreateProjectRequestData(
          projectName,
          workspace.workspaceId
        );
        const projectsResult = await createProject(
          profile.apiUrl,
          profile.token,
          requestData
        );
        if (projectsResult.err) {
          console.error(projectsResult.val.message);
          process.exit(1);
        }
        const file = await readFile(absoluteFilePath);
        const importResult = await importProjectDocumentFile(
          profile.apiUrl,
          profile.token,
          file,
          projectsResult.val
        );
        if (importResult.err) {
          console.error(importResult.val.message);
          process.exit(1);
        }
        spinner.success({ text: 'project created successfully' });
        const shouldPublish = await getShouldPublish(options);
        if (shouldPublish) {
          spinner.reset();
          spinner.start({ text: 'publishing project' });
          spinner.spin();
          const publishResult = await publishProject(
            profile.apiUrl,
            profile.token,
            projectsResult.val
          );
          if (publishResult.err) {
            console.error(publishResult.val.message);
            process.exit(1);
          }
          spinner.success({
            text: `project published successfully! link: ${profile.appUrl}/${publishResult.val.companySlug}/${publishResult.val.projectKey}`,
          });
        }
      }
    );
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

function getCreateProjectRequestData(projectName: string, workspaceId: string) {
  const requestData: CreateProjectSchema = {
    name: projectName,
    workspaceId: workspaceId,
    useSampleFile: false,
    otherDocType: {
      docType: '',
      gettingStartedSections: {
        introduction: false,
        prerequisites: false,
        quickStart: false,
        resources: false,
      },
      sdk: {
        overview: false,
        supportedLibraries: false,
        sampleCode: false,
        troubleshooting: false,
      },
      faq: {
        generalInfo: false,
        authentication: false,
        usage: false,
        billing: false,
      },
    },
  };
  return requestData;
}

async function getShouldPublish(options: {
  publish: boolean | undefined;
  noPublish: boolean | undefined;
}) {
  if (options.publish === true) {
    return true;
  }
  if (options.noPublish === true) {
    return false;
  }
  return confirm({
    message: 'What to publish the project?',
  });
}

function validateOptions(options: {
  name: string | undefined;
  workspace: string | undefined;
  file: string | undefined;
  publish: boolean | undefined;
  noPublish: boolean | undefined;
}) {
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
  if (options.publish === true && options.noPublish === true) {
    console.error(
      '--publish and --noPublish flags cannot be used at the same time'
    );
    process.exit(1);
  }
}
