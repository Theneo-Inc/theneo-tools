import FormData from 'form-data';
import * as fs from 'fs';
import {
  ApiHeaders,
  ApiQueryParams,
  deleteRequest,
  getRequest,
  handleResponse,
  postRequest,
} from './base/requests';
import { Result } from '../results';
import { ResponseSchema } from '../schema/base';
import {
  Branch,
  BranchListResponse,
  BranchPreviewLink,
  CreateBranchOptions,
  ListBranchesOptions,
  PreviewDeployment,
} from '../schema/branch';
import { FileInfo } from '../models';

export async function callListBranchesApi(
  baseUrl: string,
  headers: ApiHeaders,
  options: ListBranchesOptions
): Promise<Result<BranchListResponse, Error>> {
  const url = new URL(`${baseUrl}/api/project/${options.projectId}/branches`);
  const queryParams: ApiQueryParams = {
    versionId: options.versionId,
    status: options.status,
    kind: options.kind,
    page: options.page === undefined ? undefined : String(options.page),
    limit: options.limit === undefined ? undefined : String(options.limit),
  };
  const result = await getRequest<ResponseSchema<BranchListResponse>>({
    url,
    headers,
    queryParams,
  });
  return handleResponse(result);
}

export async function callCreateBranchApi(
  baseUrl: string,
  headers: ApiHeaders,
  options: CreateBranchOptions
): Promise<Result<Branch, Error>> {
  const url = new URL(`${baseUrl}/api/project/${options.projectId}/branches`);
  const body: Omit<CreateBranchOptions, 'projectId'> = {
    versionId: options.versionId,
    name: options.name,
    kind: options.kind,
    expiresInHours: options.expiresInHours,
  };
  const result = await postRequest<
    Omit<CreateBranchOptions, 'projectId'>,
    ResponseSchema<Branch>
  >({ url, headers, requestBody: body });
  return handleResponse(result);
}

export async function callGetBranchApi(
  baseUrl: string,
  headers: ApiHeaders,
  branchId: string
): Promise<Result<Branch, Error>> {
  const url = new URL(`${baseUrl}/api/branches/${branchId}`);
  return handleResponse(
    await getRequest<ResponseSchema<Branch>>({ url, headers })
  );
}

export async function callDeleteBranchApi(
  baseUrl: string,
  headers: ApiHeaders,
  branchId: string
): Promise<Result<Branch, Error>> {
  const url = new URL(`${baseUrl}/api/branches/${branchId}`);
  return handleResponse(
    await deleteRequest<ResponseSchema<Branch>>({ url, headers })
  );
}

export async function callRebaseBranchApi(
  baseUrl: string,
  headers: ApiHeaders,
  branchId: string
): Promise<Result<Branch, Error>> {
  const url = new URL(`${baseUrl}/api/branches/${branchId}/rebase`);
  return handleResponse(
    await postRequest<null, ResponseSchema<Branch>>({ url, headers })
  );
}

export async function callPublishBranchApi(
  baseUrl: string,
  headers: ApiHeaders,
  branchId: string
): Promise<Result<unknown, Error>> {
  const url = new URL(`${baseUrl}/api/branches/${branchId}/publish`);
  return handleResponse(
    await postRequest<null, ResponseSchema<unknown>>({ url, headers })
  );
}

export async function callCreateBranchPreviewLinkApi(
  baseUrl: string,
  headers: ApiHeaders,
  branchId: string,
  expiresInHours?: number
): Promise<Result<BranchPreviewLink, Error>> {
  const url = new URL(`${baseUrl}/api/branches/${branchId}/preview-link`);
  return handleResponse(
    await postRequest<
      { expiresInHours?: number },
      ResponseSchema<BranchPreviewLink>
    >({
      url,
      headers,
      requestBody: expiresInHours === undefined ? {} : { expiresInHours },
    })
  );
}

export interface CreatePreviewDeploymentRequest {
  projectId: string;
  versionId?: string | undefined;
  name?: string | undefined;
  expiresInHours?: number | undefined;
  tabSlug?: string | undefined;
  filePathSeparator: string;
  files: FileInfo[];
}

export async function callCreatePreviewDeploymentApi(
  baseUrl: string,
  headers: ApiHeaders,
  request: CreatePreviewDeploymentRequest
): Promise<Result<PreviewDeployment, Error>> {
  const url = new URL(`${baseUrl}/api/project/${request.projectId}/preview`);
  const bodyFormData = new FormData();
  bodyFormData.append('filePathSeparator', request.filePathSeparator);
  if (request.versionId) bodyFormData.append('versionId', request.versionId);
  if (request.name) bodyFormData.append('name', request.name);
  if (request.expiresInHours !== undefined) {
    bodyFormData.append('expiresInHours', String(request.expiresInHours));
  }
  if (request.tabSlug) bodyFormData.append('tabSlug', request.tabSlug);
  request.files.forEach(fileInfo => {
    bodyFormData.append('files', fs.createReadStream(fileInfo.filePath), {
      filepath: fileInfo.convertedFilename,
    });
  });

  return handleResponse(
    await postRequest<FormData, ResponseSchema<PreviewDeployment>>({
      url,
      headers: {
        ...headers,
        ...bodyFormData.getHeaders(),
      },
      requestBody: bodyFormData,
    })
  );
}
