import { configManager } from '../config-manager';
import {
  DEFAULT_PROFILE,
  DEFAULT_THENEO_API_BASE_URL,
  DEFAULT_THENEO_APP_BASE_URL,
} from '../consts';
import { Profile } from '../config';
import { Result } from '@theneo/sdk';

export function setApiKeyAndSave(
  token: string,
  profile?: string
): Result<null, Error> {
  profile = profile ?? DEFAULT_PROFILE;
  configManager.setProfile(profile, { token });
  return configManager.save();
}

export function getProfile(profileName?: string): Profile {
  profileName = profileName ?? DEFAULT_PROFILE;
  const result = configManager.getProfile(profileName).map(profile => {
    return {
      token: process.env.THENEO_API_KEY ?? profile.token,
      apiUrl:
        process.env.THENEO_API_URL ??
        profile.apiUrl ??
        DEFAULT_THENEO_API_BASE_URL,
      appUrl:
        process.env.THENEO_APP_URL ??
        profile.appUrl ??
        DEFAULT_THENEO_APP_BASE_URL,
    };
  });
  if (result.err) {
    console.error(result.error.message);
    process.exit(1);
  }
  return result.value;
}
