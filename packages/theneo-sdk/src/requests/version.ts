import {
  ApiHeaders,
  deleteRequest,
  getRequest,
  postRequest,
} from 'theneo/requests/base';
import {
  AddSubscriberToProjectVersionQuery,
  CreateProjectVersionOptions,
  Result,
} from 'theneo';
import { ProjectVersion } from 'theneo/schema/version';

export async function callGetProjectVersionsApi(
  baseApiUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<ProjectVersion[]>> {
  const url = new URL(`${baseApiUrl}/api/project/${projectId}/version`);
  const result = await getRequest<{ versions: ProjectVersion[] }>({
    url,
    headers,
  });

  return result.map(data => data.versions);
}

export function createProjectVersion(
  baseApiUrl: string,
  headers: ApiHeaders,
  options: CreateProjectVersionOptions
): Promise<Result<ProjectVersion>> {
  const url = new URL(`${baseApiUrl}/api/project-version`);
  return postRequest<CreateProjectVersionOptions, ProjectVersion>({
    url,
    headers,
    requestBody: options,
  });
}

export function deleteProjectVersion(
  baseApiUrl: string,
  headers: ApiHeaders,
  versionId: string
): Promise<Result<never>> {
  const url = new URL(`${baseApiUrl}/api/project-version/${versionId}`);
  return deleteRequest({
    url,
    headers,
  });
}

export function addSubscriberToProjectVersion(
  baseApiUrl: string,
  headers: ApiHeaders,
  options: AddSubscriberToProjectVersionQuery
): Promise<Result<never>> {
  const url = new URL(
    `${baseApiUrl}/api/project-version/${options.projectVersionId}/subscriber`
  );
  return postRequest<{ email: string }, never>({
    url,
    headers,
    requestBody: { email: options.email },
  });
}
