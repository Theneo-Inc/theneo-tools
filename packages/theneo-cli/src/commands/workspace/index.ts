import { Command } from 'commander';
import { initWorkspaceListCommand } from './list';

export function initWorkspaceCommand(program: Command): Command {
  return program
    .command('workspace <action>')
    .description('Workspace related commands')
    .addCommand(initWorkspaceListCommand());
}
