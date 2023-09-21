import { Command } from 'commander';
import { initProjectListCommand } from './list';
import { initProjectCreateCommand } from './create';
import { initProjectImportCommand } from './import';
import { initProjectDeleteCommand } from './delete';
import { initProjectPublishCommand } from './publish';

export function initProjectCommand(program: Command): Command {
  return program
    .command('project <action>')
    .description("Theneo's project related commands")
    .addCommand(initProjectListCommand())
    .addCommand(initProjectCreateCommand())
    .addCommand(initProjectImportCommand())
    .addCommand(initProjectDeleteCommand())
    .addCommand(initProjectPublishCommand());
}
