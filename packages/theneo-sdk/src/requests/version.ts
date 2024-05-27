import { ApiHeaders, getRequest } from 'theneo/requests/base';
import { Result } from 'theneo';
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
