import { Command } from 'commander';
import { setApiKeyAndSave } from '../context/auth';
import { password } from '@inquirer/prompts';

export function initLogin(program: Command): Command {
  return (
    program
      .command('login')
      .description('Login in theneo cli')
      // .option('-t, --token <token>', 'Specify a Theneo API token')
      .action(async (options: { token: string }) => {
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
        const result = setApiKeyAndSave(token);

        // Save the token to the config file
        if (result.err) {
          console.log(`Token saving failed. \n ${result.val.message}`);
        }
      })
  );
}
