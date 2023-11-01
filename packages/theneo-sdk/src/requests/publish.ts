import { ApiHeaders, postRequest } from 'theneo/requests/base';
import { PublishProjectResponse, Result } from 'theneo';

export function callPublishProjectApi(
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
