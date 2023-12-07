import { Theneo } from '@theneo/sdk';
import { Profile } from '../../config';
import { CLI_VERSION } from '../../utils/version';

export function createTheneo(profile: Profile): Theneo {
  return new Theneo({
    baseApiUrl: profile.apiUrl,
    baseAppUrl: profile.appUrl,
    apiKey: profile.token,
    apiClientMetadata: {
      apiClientName: 'theneo-cli',
      apiClientVersion: CLI_VERSION,
    },
  });
}
