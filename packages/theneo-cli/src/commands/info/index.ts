import { Command } from 'commander';
import chalk from 'chalk';
import { CLI_VERSION } from '../../utils/version';

function displayInfo(): void {
  // Color gradient from blue to indigo
  const blue = chalk.hex('#3B82F6');
  const indigo = chalk.hex('#6366F1');
  const purple = chalk.hex('#8B5CF6');
  const white = chalk.white;

  console.log('');
  console.log(blue('                   ::::::-           -::::::'));
  console.log(blue('                   -------           -------'));
  console.log(blue('                   ------             ------'));
  console.log(indigo('                  -------             =------'));
  console.log(indigo('                 =======               ======='));
  console.log(
    indigo('               =========       ') +
      white('@') +
      indigo('       =========')
  );
  console.log(
    indigo('            +=========       ') +
      white('@@@@@') +
      indigo('       =========+')
  );
  console.log(
    purple('       ===+=+++++++++       ') +
      white('@@@@@@@') +
      purple('       +++++++====---')
  );
  console.log(
    purple('       +++++++++++*      ') +
      white('@@@@@@@@@@@@@') +
      purple('      *++=--------')
  );
  console.log(
    purple('       ++++++++=--=       ') +
      white('@@@@@@@@@@@') +
      purple('       =-----------')
  );
  console.log(
    purple('       ++==---------=       ') +
      white('@@@@@@@') +
      purple('       =-----------==')
  );
  console.log(
    indigo('            ==========        ') +
      white('@@@') +
      indigo('        ==========')
  );
  console.log(
    indigo('               ========+       ') +
      white('@') +
      indigo('       +========')
  );
  console.log(indigo('                 =======+             +======='));
  console.log(blue('                  +++++++             +++++++'));
  console.log(blue('                   +++++++            ++++++'));
  console.log(blue('                   +++++++           +++++++'));
  console.log(blue('                   *******           *******'));
  console.log('');
  console.log(chalk.cyan.bold('  THENEO CLI'));
  console.log(chalk.dim('  ' + '─'.repeat(40)));
  console.log(
    `  ${chalk.white('Version:')}    ${chalk.green('v' + CLI_VERSION)}`
  );
  console.log(
    `  ${chalk.white('Docs:')}       ${chalk.blue('https://app.theneo.io/theneo/quickstart/automation-and-dev-tools/theneo-cli')}`
  );
  console.log(chalk.dim('  ' + '─'.repeat(40)));
  console.log('');
  console.log(chalk.dim('Build Docs Developers Love'));
  console.log('');
}

export function initInfoCommand(program: Command): Command {
  return program
    .command('info')
    .description('Display Theneo CLI information and logo')
    .action(() => {
      displayInfo();
    });
}
