import * as path from 'path';

export const THENEO_CLI_APP = 'theneo';
export const THENEO_CONFIG_DIR = path.join(
  process.env.HOME ?? process.env.USERPROFILE ?? '',
  '.config',
  'theneo'
);
export const THENEO_CLI_CONFIG_NAME = 'config';

export const DEFAULT_PROFILE = 'default';

export const DEFAULT_THENEO_API_BASE_URL =
  process.env.THENEO_API_DEFAULT_URL ?? 'https://api.theneo.io';
export const DEFAULT_THENEO_APP_BASE_URL =
  process.env.THENEO_APP_DEFAULT_URL ?? 'https://app.theneo.io';
