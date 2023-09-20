import { ConfigManager, Yaml } from './config-manager';
import { THENEO_CLI_CONFIG_NAME, THENEO_CONFIG_DIR } from '../consts';

export function initConfigManager(): ConfigManager {
  const configManager = new ConfigManager(
    THENEO_CLI_CONFIG_NAME,
    THENEO_CONFIG_DIR,
    Yaml
  );
  configManager.readInConfig().mapErr(err => {
    console.error(err.message);
    process.exit(1);
  });

  return configManager;
}

export const configManager: ConfigManager = initConfigManager();
