const packageJson = require('../../package.json');
export const CLI_VERSION: string = packageJson.version;

export function getCliVersion(): string {
  return CLI_VERSION;
}
