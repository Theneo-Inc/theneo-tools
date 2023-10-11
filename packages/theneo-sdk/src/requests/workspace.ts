import { Workspace } from '../schema';
import { Result } from '../results';
import { getRequest } from './base/requests';

export async function callUserWorkspacesApi(
  baseUrl: string,
  headers: Record<string, string>,
  role?: string
): Promise<Result<Workspace[], Error>> {
  const url = new URL(`${baseUrl}/api/users/workspaces`);
  return getRequest({
    url,
    headers,
    queryParams: {
      permission: role,
    },
  });
}
