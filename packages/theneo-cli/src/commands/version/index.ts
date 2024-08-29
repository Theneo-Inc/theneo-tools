import { Command } from 'commander';
import { initProjectVersionListCommand } from './list';
import { initProjectVersionCreateCommand } from './create';
import { initProjectVersionDeleteCommand } from './delete';
import { initAddSubscriberCreateCommand } from './add-subscriber';

export function initProjectVersionCommand(program: Command): Command {
  return program
    .command('version <action>')
    .description('Project version related commands')
    .addCommand(initProjectVersionListCommand())
    .addCommand(initProjectVersionCreateCommand())
    .addCommand(initProjectVersionDeleteCommand())
    .addCommand(initAddSubscriberCreateCommand());
}
