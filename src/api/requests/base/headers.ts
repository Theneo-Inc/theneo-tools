import { CLI_VERSION } from '../../../utils/version';

export const THENEO_API_CLIENT_KEY_HEADER_NAME = 'x-theneo-api-key';
export const THENEO_API_CLIENT_NAME_HEADER_NAME = 'x-theneo-api-client';

export function getCommonHeaders(apiKey: string): Record<string, string> {
  return {
    [THENEO_API_CLIENT_KEY_HEADER_NAME]: apiKey,
    [THENEO_API_CLIENT_NAME_HEADER_NAME]: `cli:${CLI_VERSION}`,
  };
}
