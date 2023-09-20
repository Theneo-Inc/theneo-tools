import { ConfigManager, Yaml } from './config-manager';
import { THENEO_CLI_CONFIG_NAME, THENEO_CONFIG_DIR } from '../consts';
import { log } from '@clack/prompts';

export function initConfigManager(): ConfigManager {
  const configManager = new ConfigManager(
    THENEO_CLI_CONFIG_NAME,
    THENEO_CONFIG_DIR,
    Yaml
  );
  configManager.readInConfig().mapErr(err => {
    log.error(err.message);
    process.exit(1);
  });

  return configManager;
}

export const configManager: ConfigManager = initConfigManager();
