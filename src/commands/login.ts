import { Command } from 'commander';
import { isCancel, cancel, text, outro } from '@clack/prompts';
import { setApiKeyAndSave } from '../context/auth';

export function initLogin(program: Command): Command {
  return (
    program
      .command('login')
      .description('Login in theneo cli')
      // .option('-t, --token <token>', 'Specify a Theneo API token')
      .action(async (options: { token: string }) => {
        let token = options.token;
        if (!token) {
          const tokenInput = await text({
            message: 'Input Theneo API Token',
            placeholder: 'xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxx',
            validate(value) {
              if (value.length === 0) return 'Value is required!';
              return undefined;
            },
          });
          if (isCancel(tokenInput)) {
            cancel('Operation cancelled.');
            process.exit(0);
          }

          token = tokenInput;
        }
        const result = setApiKeyAndSave(token);

        // Save the token to the config file
        if (result.err) {
          cancel(`Token saved failed. \n ${result.val.message}`);
          return;
        }
        outro('Token saved successfully.');
      })
  );
}
