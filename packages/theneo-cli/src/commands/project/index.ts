import { Command } from 'commander';
import { initProjectListCommand } from './list';
import { initProjectCreateCommand } from './create';
import { initProjectImportCommand } from './import';
import { initProjectDeleteCommand } from './delete';
import { initProjectPublishCommand } from './publish';
import { initProjectPreviewCommand } from './preview';

export function initProjectCommand(program: Command): Command {
  return program
    .command('project <action>')
    .description('Project related commands')
    .addCommand(initProjectListCommand())
    .addCommand(initProjectCreateCommand())
    .addCommand(initProjectImportCommand())
    .addCommand(initProjectDeleteCommand())
    .addCommand(initProjectPublishCommand())
    .addCommand(initProjectPreviewCommand());
}
