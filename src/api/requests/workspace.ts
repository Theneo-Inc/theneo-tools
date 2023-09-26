import axios from 'axios';
import { getCommonHeaders } from './base/headers';
import { Workspace } from '../schema/workspace';
import { Result } from '../../results';

export async function queryUserWorkspaces(
  baseUrl: string,
  apiKey: string,
  role?: string
): Promise<Result<Workspace[], Error>> {
  const urlPath = new URL(`${baseUrl}/users/workspaces/api-client`);
  if (role) {
    urlPath.searchParams.append('permission', role);
  }
  try {
    const result = await axios.get<Workspace[]>(urlPath.toString(), {
      headers: getCommonHeaders(apiKey),
    });

    if (result.status !== 200) {
      return Result.err(new Error('API returned status code ' + result.status));
    }

    const data = result.data;
    if (data === undefined) {
      return Result.err(new Error('No data returned from API'));
    }
    return Result.ok(data);
  } catch (error) {
    return Result.err(error as Error);
  }
}
