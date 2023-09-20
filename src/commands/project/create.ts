import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createProject, importProjectDocumentFile } from '../../api/project';
import { DEFAULT_THENEO_API_BASE_URL } from '../../consts';
import { cancel, isCancel, log, select, spinner, text } from '@clack/prompts';
import { queryUserWorkspaces } from '../../api/workspace';
import { Workspace } from '../../api/schema/workspace';
import { CreateProjectSchema } from '../../api/schema/project';
import { readFile } from 'fs/promises';
import { checkDocumentationFile, getAbsoluteFilePath } from '../../utils/file';

interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

async function getWorkspaceId(workspaces: Workspace[]): Promise<string> {
  if (workspaces.length === 0) {
    log.error('No workspaces found.');
    process.exit(1);
  }
  if (workspaces.length === 1) {
    const workspace = workspaces[0]!;
    log.info(`Using default workspace: ${workspace.name}`);
    return workspace.workspaceId;
  }

  const workspaceId = await select<SelectOption[], string>({
    message: 'Pick a workspace.',
    options: workspaces.map(ws => {
      if (ws.isDefault) {
        return { value: ws.workspaceId, label: ws.name, hint: 'default' };
      }
      return { value: ws.workspaceId, label: ws.name };
    }),
  });
  if (isCancel(workspaceId)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return workspaceId;
}

function getCreatePorjectRequestData(projectName: string, workspaceId: string) {
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
      profile.apiUrl ?? DEFAULT_THENEO_API_BASE_URL,
      profile.token
    );
    const projectName = await text({
      message: 'Project Name',
      validate(value) {
        if (value.length === 0) return 'Name is required!';
        return undefined;
      },
    });
    if (isCancel(projectName)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    const s = spinner();
    s.start();
    const workspacesResult = await workspacesPromise;
    s.stop();
    if (workspacesResult.err) {
      log.error(workspacesResult.val.message);
      process.exit(1);
    }
    const workspaceId = await getWorkspaceId(workspacesResult.val);
    const specFileName = await text({
      message: 'API Spec file name',
      validate(value) {
        if (value.length === 0) return 'File is required!';
        return undefined;
      },
    });
    if (isCancel(specFileName)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }

    s.start('creating project\n');
    const absoluteFilePath = getAbsoluteFilePath(specFileName);
    const isValidRes = await checkDocumentationFile(absoluteFilePath);
    if (isValidRes.err) {
      log.error(isValidRes.val);
      process.exit(1);
    }

    const requestData = getCreatePorjectRequestData(projectName, workspaceId);
    const projectsResult = await createProject(
      profile.apiUrl ?? DEFAULT_THENEO_API_BASE_URL,
      profile.token,
      requestData
    );
    if (projectsResult.err) {
      log.error(projectsResult.val.message);
      process.exit(1);
    }
    const file = await readFile(absoluteFilePath);
    const importResult = await importProjectDocumentFile(
      profile.apiUrl ?? DEFAULT_THENEO_API_BASE_URL,
      profile.token,
      projectsResult.val,
      file
    );
    if (importResult.err) {
      log.error(importResult.val.message);
      process.exit(1);
    }
    s.stop('project created: ' + importResult.val);
  });
}
