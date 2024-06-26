import { Command } from 'commander';
import { setApiKeyAndSave } from '../context/auth';
import { password, confirm } from '@inquirer/prompts';
import { configManager } from '../config-manager';
import { tryCatch } from '../utils/exception';
import { DEFAULT_PROFILE } from '../consts';

async function getApiKeyToken(options: { token: string }): Promise<string> {
  let token = options.token;
  if (!token) {
    token = await password({
      message: 'Input Theneo API Token:',
      mask: true,
      validate: value => {
        if (value.length === 0) return 'Value is required!';
        return true;
      },
    });
  }
  return token;
}

export function initLogin(program: Command): Command {
  return program
    .command('login')
    .description('Login in theneo cli')
    .option('-t, --token <token>', 'Specify a Theneo API token')
    .option(
      '--profile <profile>',
      'Use a specific profile from your config file.',
      DEFAULT_PROFILE
    )
    .option('--api-url <apiUrl>', 'Specify a Theneo API URL')
    .option('--app-url <appUrl>', 'Specify a Theneo APP URL')
    .action(
      tryCatch(
        async (options: {
          token: string;
          profile: string | undefined;
          apiUrl: string | undefined;
          appUrl: string | undefined;
        }) => {
          if (options.profile) {
            const profileRes = configManager.getProfile(options.profile);
            if (profileRes.ok) {
              const overwrite = await confirm({
                message: `profile called - ${options.profile} - already exists. Do you want to overwrite it?`,
              });
              if (!overwrite) {
                return;
              }
            }
          }

          const token = await getApiKeyToken(options);
          const result = setApiKeyAndSave(
            token,
            options.profile,
            options.apiUrl,
            options.appUrl
          );

          // Save the token to the config file
          if (result.err) {
            console.log(`Token saving failed. \n ${result.error.message}`);
          }
        }
      )
    );
}
