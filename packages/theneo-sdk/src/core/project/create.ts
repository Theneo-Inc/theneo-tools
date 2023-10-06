import {
  ApiHeaders,
  callCreateProjectNew,
  callUserWorkspaces,
  CreateProjectWithFileContent,
} from 'theneo/requests';
import {
  CreateProjectOptions,
  WorkspaceOption,
} from 'theneo/models/inputs/project';
import { DescriptionGenerationType, Result, UserRole } from 'theneo';
import fs from 'fs/promises';

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
  const workspacesResult = await callUserWorkspaces(
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

export async function createProject(
  baseUrl: string,
  headers: ApiHeaders,
  options: CreateProjectOptions
): Promise<Result<string>> {
  const workspaceId = await getWorkspaceId(baseUrl, headers, options.workspace);

  const createFileOptions: CreateProjectWithFileContent = {
    name: options.name,
    workspaceId: workspaceId,
    isPublic: options.isPublic ?? false,
    publish: options.publish ?? false,
    descriptionGenerationType:
      options.descriptionGenerationType ??
      DescriptionGenerationType.NO_GENERATION,
  };

  if (options.data?.sampleData !== undefined) {
    createFileOptions.sampleFile = options.data.sampleData;
  }
  if (options.data?.file !== undefined) {
    // TODO check if file exists
    createFileOptions.file = await fs.readFile(options.data.file);
  }
  if (options.data?.url !== undefined) {
    createFileOptions.link = options.data.url.toString();
  }
  if (options.data?.text !== undefined) {
    createFileOptions.text = options.data.text;
  }
  if (options.data?.postman !== undefined) {
    createFileOptions.postmanKey = options.data.postman.apiKey;
    createFileOptions.postmanId = options.data.postman.collection;
  }

  return callCreateProjectNew(baseUrl, headers, createFileOptions);
}
