import { Workspace } from '../schema';
import { Result } from '../results';
import { getRequest } from './base/requests';

export async function callUserWorkspaces(
  baseUrl: string,
  headers: Record<string, string>,
  role?: string
): Promise<Result<Workspace[], Error>> {
  const url = new URL(`${baseUrl}/users/workspaces/api-client`);
  return getRequest({
    url,
    headers,
    queryParams: {
      permission: role,
    },
  });
}
