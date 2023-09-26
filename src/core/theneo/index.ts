import { Theneo } from '../../api/theneo.facade';
import { Profile } from '../../config';
import { getCliVersion } from '../../utils/version';

export function createTheneo(profile: Profile): Theneo {
  return new Theneo({
    baseApiUrl: profile.apiUrl,
    apiKey: profile.token,
    apiClientName: `theneo-cli/${getCliVersion()}`,
  });
}
