import { Workspace } from '../schema/workspace';
import { Result } from '../../results';
import { getRequest } from './base/requests';

export async function queryUserWorkspaces(
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
