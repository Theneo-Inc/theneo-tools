import { Command } from 'commander';
import { initProjectListCommand } from './list';
import { initProjectCreateCommand } from './create';

export function initProjectCommand(program: Command): Command {
  return program
    .command('project <action>')
    .description("Theneo's project related commands")
    .addCommand(initProjectListCommand())
    .addCommand(initProjectCreateCommand());
}
