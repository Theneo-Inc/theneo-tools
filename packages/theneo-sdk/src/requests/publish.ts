import { ApiHeaders, postRequest } from 'theneo/requests/base';
import { PublishProjectResponse, Result } from 'theneo';

export function callPublishProjectApi(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string,
  versionId?: string
): Promise<Result<PublishProjectResponse, Error>> {
  const url = new URL(`${baseUrl}/api/publish/${projectId}`);
  if (versionId) {
    url.searchParams.append('versionId', versionId);
  }
  return postRequest<null, PublishProjectResponse>({
    url,
    headers,
  });
}
