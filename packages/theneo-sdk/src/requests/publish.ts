import { ApiHeaders, postRequest } from 'theneo/requests/base';
import { PublishProjectResponse, Result } from 'theneo';

export async function callPublishProjectApi(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<PublishProjectResponse, Error>> {
  const url = new URL(`${baseUrl}/api/publish/${projectId}`);
  return postRequest<null, PublishProjectResponse>({
    url,
    headers,
  });
}

export async function callPreviewProjectApi(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<PublishProjectResponse, Error>> {
  const url = new URL(`${baseUrl}/api/publish/${projectId}/preview`);
  return postRequest<null, PublishProjectResponse>({
    url,
    headers,
  });
}
