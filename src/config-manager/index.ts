import { ConfigManager, Yaml } from './config-manager';
import { THENEO_CLI_CONFIG_NAME, THENEO_CONFIG_DIR } from '../consts';

export function initConfigManager(): ConfigManager {
  const configManager = new ConfigManager(
    THENEO_CLI_CONFIG_NAME,
    THENEO_CONFIG_DIR,
    Yaml
  );
  const readInConfigRes = configManager.readInConfig();
  if (readInConfigRes.err) {
    console.error(readInConfigRes.error.message);
    process.exit(1);
  }

  return configManager;
}

export const configManager: ConfigManager = initConfigManager();
