import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createProject, importProjectDocumentFile } from '../../api/project';
import { queryUserWorkspaces } from '../../api/workspace';
import { Workspace } from '../../api/schema/workspace';
import { CreateProjectSchema } from '../../api/schema/project';
import { readFile } from 'fs/promises';
import { checkDocumentationFile, getAbsoluteFilePath } from '../../utils/file';
import { input, select } from '@inquirer/prompts';
import { createSpinner } from 'nanospinner';

async function getWorkspaceId(workspaces: Workspace[]): Promise<string> {
  if (workspaces.length === 0) {
    console.error('No workspaces found.');
    process.exit(1);
  }
  if (workspaces.length === 1) {
    const workspace = workspaces[0]!;
    console.info(`Using default workspace: ${workspace.name}`);
    return workspace.workspaceId;
  }

  return select({
    message: 'Pick a workspace.',
    choices: workspaces.map(ws => {
      if (ws.isDefault) {
        return { value: ws.workspaceId, name: ws.name, description: 'default' };
      }
      return { value: ws.workspaceId, name: ws.name };
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

export function initProjectCreateCommand() {
  return new Command('create').action(async () => {
    const profile = getProfile().unwrap();
    const workspacesPromise = queryUserWorkspaces(
      profile.apiUrl,
      profile.token
    );
    const projectName = await input({
      message: 'Project Name:',
      validate: value => {
        if (value.length === 0) return 'Name is required!';
        return true;
      },
    });
    const spinner = createSpinner().start();
    spinner.start();
    const workspacesResult = await workspacesPromise;
    spinner.reset();
    if (workspacesResult.err) {
      console.error(workspacesResult.val.message);
      process.exit(1);
    }
    const workspaceId = await getWorkspaceId(workspacesResult.val);
    const specFileName = await input({
      message: 'API file name (eg: openapi.yml) : ',
      validate: value => {
        if (value.length === 0) return 'File is required!';
        return true;
      },
    });

    spinner.start({ text: 'creating project' });
    const absoluteFilePath = getAbsoluteFilePath(specFileName);
    const isValidRes = await checkDocumentationFile(absoluteFilePath);
    if (isValidRes.err) {
      console.error(isValidRes.val);
      process.exit(1);
    }

    const requestData = getCreateProjectRequestData(projectName, workspaceId);
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
  });
}
