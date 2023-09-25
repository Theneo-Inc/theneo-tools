import { Command } from 'commander';
import { setApiKeyAndSave } from '../context/auth';
import { password, confirm } from '@inquirer/prompts';
import { configManager } from '../config-manager';

async function getApiKeyToken(options: { token: string }) {
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
      '-profile <profile>',
      'Use a specific profile from your config file.'
    )
    .action(async (options: { token: string; profile: string | undefined }) => {
      if (options.profile) {
        const profileRes = configManager.getProfile(options.profile);
        if (profileRes.ok) {
          const overwrite = await confirm({
            message: `profile -${options.profile} - already exists. Do you want to overwrite it?`,
          });
          if (!overwrite) {
            return;
          }
        }
      }

      const token = await getApiKeyToken(options);
      const result = setApiKeyAndSave(token, options.profile);

      // Save the token to the config file
      if (result.err) {
        console.log(`Token saving failed. \n ${result.val.message}`);
      }
    });
}
