import { Command } from 'commander';
import { initProjectVersionListCommand } from './list';
import { initProjectVersionCreateCommand } from './create';
import { initProjectVersionDeleteCommand } from './delete';

export function initProjectVersionCommand(program: Command): Command {
  return program
    .command('version <action>')
    .description("Theneo's project version related commands")
    .addCommand(initProjectVersionListCommand())
    .addCommand(initProjectVersionCreateCommand())
    .addCommand(initProjectVersionDeleteCommand());
}
