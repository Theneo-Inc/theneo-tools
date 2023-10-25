import { ApiHeaders, getRequest } from 'theneo/requests/base';
import { Result } from 'theneo';
import { ExportedProject } from 'theneo/schema/export';

export function exportProjectData(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string
): Promise<Result<ExportedProject, Error>> {
  const url = new URL(`${baseUrl}/api/section/export`);
  url.searchParams.append('projectId', projectId);

  return getRequest<ExportedProject>({
    url,
    headers,
  });
}
