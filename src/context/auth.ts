import { configManager } from '../config-manager';
import { DEFAULT_PROFILE } from '../consts';
import { Result } from 'ts-results';
import { Profile } from '../config';

export function setApiKeyAndSave(
  token: string,
  profile?: string
): Result<null, Error> {
  profile = profile ?? DEFAULT_PROFILE;
  configManager.setProfile(profile, { token });
  return configManager.save();
}

export function getProfile(profile?: string): Result<Profile, Error> {
  profile = profile ?? DEFAULT_PROFILE;
  return configManager.getProfile(profile);
}
