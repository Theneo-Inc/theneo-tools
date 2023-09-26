import {
  convertProject,
  CreateProjectSchema,
  ProjectSchema,
  PublishProjectResponse,
  PublishProjectSchema,
} from '../schema/project';
import { Project } from '../../models/project';
import { ResponseSchema } from '../schema/base';
import FormData from 'form-data';
import { Result } from '../../results';
import {
  ApiHeaders,
  deleteRequest,
  getRequest,
  postRequest,
} from './base/requests';

export async function queryProjectList(
  baseUrl: string,
  headers: ApiHeaders
): Promise<Result<Project[], Error>> {
  const url = new URL(`${baseUrl}/project/api-client`);
  const result = await getRequest<ResponseSchema<ProjectSchema[]>>({
    url,
    headers,
  });
  return result.chain(data => {
    if (data.message !== 'Success') {
      return Result.err(new Error(data.message));
    }
    return Result.ok(data.data.map(project => convertProject(project)));
  });
}

function handleResponse<T>(
  result: Result<ResponseSchema<T>, Error>
): Result<T, Error> {
  return result.chain(data => {
    if (data.message !== 'Success') {
      return Result.err(new Error(data.message));
    }
    return Result.ok(data.data);
  });
}

export async function createProject(
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

export async function importProjectDocumentFile(
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

export async function publishProject(
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

export async function deleteProject(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<void, Error>> {
  const url = new URL(`${baseUrl}/project/${projectId}/api-client`);
  return deleteRequest({ url, headers });
}

export interface CompleteProjectCreationRequest {
  shouldOverride?: boolean;
  isProjectPublic: boolean;
}

export async function completeProjectCreation(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string,
  requestBody: CompleteProjectCreationRequest
): Promise<Result<null, Error>> {
  const url = new URL(
    `${baseUrl}/project/${projectId}/create/complete/api-client`
  );
  return postRequest<CompleteProjectCreationRequest, null>({
    url,
    headers,
    requestBody,
  });
}

export async function getDescriptionGenerationStatus(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<PublishProjectSchema, Error>> {
  const url = new URL(`${baseUrl}/project/${projectId}/status/api-client`);
  return getRequest<PublishProjectSchema>({ url, headers });
}
