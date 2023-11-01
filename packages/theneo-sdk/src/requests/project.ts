import {
  CreateProjectResponse,
  ImportResponse,
  ProjectCreationStatusResponse,
  ProjectSchema,
} from '../schema';
import FormData from 'form-data';
import { Result } from '../results';
import {
  ApiHeaders,
  deleteRequest,
  getRequest,
  postRequest,
} from './base/requests';
import { CreateProjectInput, ImportProjectInput } from 'theneo/models';

export function callGetProjectListApi(
  baseUrl: string,
  headers: ApiHeaders
): Promise<Result<ProjectSchema[], Error>> {
  const url = new URL(`${baseUrl}/api/project`);
  return getRequest<ProjectSchema[]>({
    url,
    headers,
  });
}

export function callCreateProjectApi(
  baseUrl: string,
  headers: ApiHeaders,
  options: CreateProjectInput
): Promise<Result<CreateProjectResponse, Error>> {
  const url = new URL(`${baseUrl}/api/project`);
  const bodyFormData = new FormData();
  bodyFormData.append('projectName', options.name);
  bodyFormData.append('isPublic', JSON.stringify(options.isPublic));
  bodyFormData.append('publish', JSON.stringify(options.publish));
  bodyFormData.append(
    'descriptionGenerationType',
    options.descriptionGenerationType
  );
  if (options.otherDocumentType) {
    bodyFormData.append(
      'otherDocumentType',
      JSON.stringify(options.otherDocumentType)
    );
  }
  if (options.sampleFile) {
    bodyFormData.append('sampleFile', JSON.stringify(options.sampleFile));
  }
  if (options.postmanCollections) {
    bodyFormData.append(
      'postmanCollections',
      JSON.stringify(options.postmanCollections)
    );
  }
  if (options.postmanKey) {
    bodyFormData.append('postmanKey', options.postmanKey);
  }
  if (options.workspaceId) {
    bodyFormData.append('workspaceId', options.workspaceId);
  }
  if (options.file) {
    bodyFormData.append('file', options.file);
  }
  if (options.link) {
    bodyFormData.append('link', options.link);
  }
  if (options.text) {
    bodyFormData.append('text', options.text);
  }

  return postRequest<FormData, CreateProjectResponse>({
    url,
    headers: {
      ...headers,
      ...bodyFormData.getHeaders(),
    },
    requestBody: bodyFormData,
  });
}

export function callImportProjectApi(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string,
  options: ImportProjectInput
): Promise<Result<ImportResponse, Error>> {
  const url = new URL(`${baseUrl}/api/project/${projectId}/import`);
  const bodyFormData = new FormData();
  bodyFormData.append('publish', JSON.stringify(options.publish));

  // TODO validate
  if (options.postmanCollections) {
    bodyFormData.append(
      'postmanCollections',
      JSON.stringify(options.postmanCollections)
    );
  }
  if (options.postmanKey) {
    bodyFormData.append('postmanKey', options.postmanKey);
  }
  if (options.file) {
    bodyFormData.append('file', options.file);
  }
  if (options.link) {
    bodyFormData.append('link', options.link);
  }
  if (options.text) {
    bodyFormData.append('text', options.text);
  }
  if (options.importOption) {
    bodyFormData.append('importOption', options.importOption);
  }

  return postRequest<FormData, ImportResponse>({
    url,
    headers: {
      ...headers,
      ...bodyFormData.getHeaders(),
    },
    requestBody: bodyFormData,
  });
}

export function callDeleteProjectApi(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<void, Error>> {
  const url = new URL(`${baseUrl}/api/project/${projectId}`);
  return deleteRequest({ url, headers });
}

export function callDescriptionGenerationStatusApi(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<ProjectCreationStatusResponse, Error>> {
  const url = new URL(`${baseUrl}/api/project/creation-status/${projectId}`);
  return getRequest<ProjectCreationStatusResponse>({ url, headers });
}
