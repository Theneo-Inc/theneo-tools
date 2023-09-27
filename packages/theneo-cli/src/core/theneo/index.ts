import { Profile } from '../../config';
import { getCliVersion } from '../../utils/version';
import { Theneo } from '@theneo/sdk';

export function createTheneo(profile: Profile): Theneo {
  return new Theneo({
    baseApiUrl: profile.apiUrl,
    apiKey: profile.token,
    apiClientName: `theneo-cli/${getCliVersion()}`,
  });
}
