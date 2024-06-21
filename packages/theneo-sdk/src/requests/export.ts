import { ApiHeaders, getRequest } from 'theneo/requests/base';
import { Result } from 'theneo';
import { ExportedProject } from 'theneo/schema/export';

export function exportProjectData(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string,
  versionId?: string,
  shouldGetPublicViewData: boolean = false
): Promise<Result<ExportedProject, Error>> {
  const url = new URL(`${baseUrl}/api/section/export`);
  url.searchParams.append('projectId', projectId);
  if (versionId) {
    url.searchParams.append('versionId', versionId);
  }

  url.searchParams.append(
    'shouldGetPublicViewData',
    String(shouldGetPublicViewData)
  );

  return getRequest<ExportedProject>({
    url,
    headers,
  });
}
