import {
  callCreateProjectApi,
  callCreateProjectWithFilesApi,
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
import { CreateProjectInput, FileInfo } from 'theneo/models';
import { ApiHeaders } from 'theneo/requests/base';
import path from 'path';
import { convertFilePath } from 'theneo/utils/file';

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

function getAllFilesFromDirectory(
  directory: string,
  filesList: FileInfo[] = [],
  metadata: Record<string, string> = {}
): { filesList: FileInfo[]; metadata: Record<string, string> } {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFilesFromDirectory(filePath, filesList, metadata);
    } else {
      convertFilePath(filePath);
      const convertedFilename = convertFilePath(filePath);
      filesList.push({
        fileName: file,
        directory,
        convertedFilename: convertedFilename,
        filePath: filePath,
      });
      metadata[convertedFilename] = filePath;
    }
  }

  return { filesList, metadata };
}

export async function createProject(
  baseUrl: string,
  headers: ApiHeaders,
  options: CreateProjectOptions
): Promise<Result<CreateProjectResponse>> {
  const workspaceId = await getWorkspaceId(baseUrl, headers, options.workspace);
  const createInput: CreateProjectInput = {
    name: options.name,
    workspaceId: workspaceId,
    isPublic: options.isPublic ?? false,
    publish: options.publish ?? false,
    descriptionGenerationType:
      options.descriptionGenerationType ??
      DescriptionGenerationType.NO_GENERATION,
  };
  if (options.data?.directory !== undefined) {
    const allFilesFromDirectory = getAllFilesFromDirectory(
      options.data.directory
    );
    if (allFilesFromDirectory.filesList.length === 0) {
      return Err(`${options.data.directory} - Directory is empty`);
    }
    createInput.filesData = {
      files: allFilesFromDirectory.filesList,
      metadata: allFilesFromDirectory.metadata,
    };

    return callCreateProjectWithFilesApi(baseUrl, headers, createInput);
  }

  // TODO validate
  if (options?.sampleData !== undefined) {
    createInput.sampleFile = options.sampleData;
  }
  if (options.data?.file !== undefined) {
    if (!fs.existsSync(options.data.file)) {
      return Err(new Error('File does not exist'));
    }
    createInput.file = fs.readFileSync(options.data.file);
  }

  if (options.data?.link !== undefined) {
    createInput.link = options.data.link.toString();
  }
  if (options.data?.text !== undefined) {
    createInput.text = options.data.text;
  }
  if (options.data?.postman !== undefined) {
    createInput.postmanKey = options.data.postman.apiKey;
    createInput.postmanCollections = options.data.postman.collectionIds;
  }

  return callCreateProjectApi(baseUrl, headers, createInput);
}
