import {
  CompleteProjectCreationRequest,
  CreateOtherTypeOfDocOptions,
  CreateProjectSchema,
  DescriptionGenerationType,
  ProjectSchema,
  PublishProjectResponse,
  PublishProjectSchema,
  ResponseSchema,
} from '../schema';
import FormData from 'form-data';
import { Err, Ok, Result } from '../results';
import {
  ApiHeaders,
  deleteRequest,
  getRequest,
  postRequest,
} from './base/requests';

function handleResponse<T>(
  result: Result<ResponseSchema<T>, Error>
): Result<T, Error> {
  return result.chain(data => {
    if (data.message !== 'Success') {
      return Err(new Error(data.message));
    }
    return Ok(data.data);
  });
}

export async function callProjectList(
  baseUrl: string,
  headers: ApiHeaders
): Promise<Result<ProjectSchema[], Error>> {
  const url = new URL(`${baseUrl}/api/project`);
  return getRequest<ProjectSchema[]>({
    url,
    headers,
  });
}

export async function callCreateProject(
  baseUrl: string,
  headers: ApiHeaders,
  requestBody: CreateProjectSchema
): Promise<Result<string, Error>> {
  const url = new URL(`${baseUrl}/project/create/api-client`);
  const result = await postRequest<CreateProjectSchema, ResponseSchema<string>>(
    {
      url,
      headers,
      requestBody,
    }
  );
  return handleResponse(result);
}

export async function callImportProjectDocumentFile(
  baseUrl: string,
  headers: ApiHeaders,
  content: Buffer,
  projectId: string
): Promise<Result<string, Error>> {
  const url = new URL(`${baseUrl}/project/${projectId}/import/api-client`);
  const bodyFormData = new FormData();
  bodyFormData.append('file', content);
  const result = await postRequest<FormData, ResponseSchema<string>>({
    url,
    headers: {
      ...headers,
      ...bodyFormData.getHeaders(),
    },
    requestBody: bodyFormData,
  });
  return handleResponse(result);
}

export async function callPublishProject(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<PublishProjectResponse, Error>> {
  const url = new URL(`${baseUrl}/publish/${projectId}/api-client`);
  const result = await postRequest<
    null,
    ResponseSchema<PublishProjectResponse>
  >({
    url,
    headers,
  });

  return handleResponse(result);
}

export async function callDeleteProject(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<void, Error>> {
  const url = new URL(`${baseUrl}/project/${projectId}/api-client`);
  return deleteRequest({ url, headers });
}

export async function callCompleteProjectCreation(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string,
  requestBody: CompleteProjectCreationRequest
): Promise<Result<void, Error>> {
  const url = new URL(
    `${baseUrl}/project/${projectId}/create/complete/api-client`
  );
  return postRequest<CompleteProjectCreationRequest, void>({
    url,
    headers,
    requestBody,
  });
}

export async function callDescriptionGenerationStatus(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<PublishProjectSchema, Error>> {
  const url = new URL(`${baseUrl}/project/${projectId}/status/api-client`);
  return getRequest<PublishProjectSchema>({ url, headers });
}

export interface CreateProjectWithFileContent {
  name: string;
  isPublic: boolean;
  publish: boolean;
  descriptionGenerationType: DescriptionGenerationType;
  workspaceId?: string | undefined;
  sampleFile?: boolean;
  file?: Buffer;
  link?: string;
  text?: string;
  postmanKey?: string;
  postmanId?: string;
  otherDocumentType?: CreateOtherTypeOfDocOptions;
}

export async function callCreateProjectNew(
  baseUrl: string,
  headers: ApiHeaders,
  options: CreateProjectWithFileContent
): Promise<Result<string, Error>> {
  const url = new URL(`${baseUrl}/api/project/create`);
  const bodyFormData = new FormData();
  bodyFormData.append('name', options.name);
  bodyFormData.append('isPublic', options.isPublic);
  bodyFormData.append('publish', options.publish);
  bodyFormData.append(
    'descriptionGenerationType',
    options.descriptionGenerationType
  );
  if (options.otherDocumentType) {
    bodyFormData.append('otherDocumentType', options.otherDocumentType);
  }
  if (options.postmanId) {
    bodyFormData.append('postmanId', options.postmanId);
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
  if (options.text) {
    bodyFormData.append('text', options.text);
  }

  const result = await postRequest<FormData, ResponseSchema<string>>({
    url,
    headers: {
      ...headers,
      ...bodyFormData.getHeaders(),
    },
    requestBody: bodyFormData,
  });
  return handleResponse(result);
}
