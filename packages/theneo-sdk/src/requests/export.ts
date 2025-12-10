import { ApiHeaders, getRequest } from 'theneo/requests/base';
// eslint-disable-next-line node/no-extraneous-import
import { Result } from 'theneo';
import { ExportedProject } from 'theneo/schema/export';

export function exportProjectData(
  baseUrl: string,
  headers: ApiHeaders,
  projectId: string,
  versionId?: string,
  shouldGetPublicViewData: boolean = false,
  openapi: boolean = false,
  tabSlug?: string
): Promise<Result<ExportedProject, Error>> {
  const url = new URL(`${baseUrl}/api/section/export`);
  url.searchParams.append('projectId', projectId);

  if (openapi) {
    url.searchParams.append('isOpenApi', 'true');
  }

  if (versionId) {
    url.searchParams.append('versionId', versionId);
  }

  url.searchParams.append(
    'shouldGetPublicViewData',
    String(shouldGetPublicViewData)
  );

  if (tabSlug) {
    url.searchParams.append('tabSlug', tabSlug);
  }

  return getRequest<ExportedProject>({
    url,
    headers,
  });
}
