import {
  callCreateProjectApi,
  callCreateProjectFromDirectoryApi,
  callUserWorkspacesApi,
} from 'theneo/requests';

import * as fs from 'fs';
import {
  CreateProjectOptions,
  CreateProjectResponse,
  DescriptionGenerationType,
  Err,
  Result,
  UserRole,
  WorkspaceOption,
} from 'theneo';
import {
  CreateProjectFromDirectoryInput,
  CreateProjectInput,
} from 'theneo/models';
import { ApiHeaders } from 'theneo/requests/base';
import {
  FILE_SEPARATOR,
  getAllFilesFromDirectory,
  getFilePath,
} from 'theneo/utils/file';

async function getWorkspaceId(
  baseUrl: string,
  headers: ApiHeaders,
  workspace: WorkspaceOption | undefined
): Promise<string | undefined> {
  if (!workspace) {
    return undefined;
  }
  if (workspace.id) {
    return workspace.id;
  }
  if (!workspace.key) {
    return undefined;
  }
  const workspacesResult = await callUserWorkspacesApi(
    baseUrl,
    headers,
    UserRole.EDITOR
  );

  if (workspacesResult.err) {
    return undefined;
  }
  return workspacesResult.value.find(ws => ws.slug === workspace.key)
    ?.workspaceId;
}

function createProjectFromDirectory(
  options: CreateProjectOptions,
  workspaceId: string | undefined,
  baseUrl: string,
  headers: ApiHeaders
): Promise<Result<CreateProjectResponse, Error>> | Result<never, Error> {
  if (!options.data?.directory) {
    return Err(`Directory not provided ${options.data?.directory}`);
  }
  if (!fs.existsSync(options.data.directory)) {
    return Err(`${options.data.directory} - Directory does not exist`);
  }
  const filesInfo = getAllFilesFromDirectory(options.data.directory);
  if (filesInfo.length === 0) {
    return Err(`${options.data.directory} - Directory is empty`);
  }
  const createInput: CreateProjectFromDirectoryInput = {
    filePathSeparator: FILE_SEPARATOR,
    files: filesInfo,
    name: options.name,
    workspaceId: workspaceId,
    isPublic: options.isPublic ?? false,
    publish: options.publish ?? false,
    descriptionGenerationType:
      options.descriptionGenerationType ??
      DescriptionGenerationType.NO_GENERATION,
  };

  return callCreateProjectFromDirectoryApi(baseUrl, headers, createInput);
}

export async function createProject(
  baseUrl: string,
  headers: ApiHeaders,
  options: CreateProjectOptions
): Promise<Result<CreateProjectResponse>> {
  const workspaceId = await getWorkspaceId(baseUrl, headers, options.workspace);

  if (options.data?.directory !== undefined) {
    return createProjectFromDirectory(options, workspaceId, baseUrl, headers);
  }

  const createInput: CreateProjectInput = {
    name: options.name,
    workspaceId: workspaceId,
    isPublic: options.isPublic ?? false,
    publish: options.publish ?? false,
    descriptionGenerationType:
      options.descriptionGenerationType ??
      DescriptionGenerationType.NO_GENERATION,
  };
  // TODO validate
  if (options?.sampleData) {
    createInput.sampleFile = options.sampleData;
  }
  if (options.data?.file) {
    const filePath = getFilePath(options.data.file);
    if (filePath.err) {
      return Promise.resolve(Err(filePath.error));
    }
    createInput.file = fs.readFileSync(filePath.unwrap());
  }

  if (options.data?.link) {
    createInput.link = options.data.link.toString();
  }
  if (options.data?.text) {
    createInput.text = options.data.text;
  }
  if (options.data?.postman) {
    createInput.postmanKey = options.data.postman.apiKey;
    createInput.postmanCollections = options.data.postman.collectionIds;
  }

  return callCreateProjectApi(baseUrl, headers, createInput);
}
