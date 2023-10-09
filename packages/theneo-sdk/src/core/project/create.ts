import {
  ApiHeaders,
  callCreateProjectApi,
  callUserWorkspacesApi,
} from 'theneo/requests';
import {
  CreateProjectOptions,
  WorkspaceOption,
} from 'theneo/models/inputs/project';
import {
  CreateProjectInput,
  CreateProjectResponse,
  DescriptionGenerationType,
  Err,
  Result,
  UserRole,
} from 'theneo';
import * as fs from 'fs';

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
    createInput.postmanCollections = options.data.postman.collectionId;
  }

  return callCreateProjectApi(baseUrl, headers, createInput);
}
