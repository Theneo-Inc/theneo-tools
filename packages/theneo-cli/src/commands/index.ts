import { Command } from 'commander';
import { THENEO_CLI_APP } from '../consts';
import { initLogin } from './login';
import { initProjectCommand } from './project';
import { CLI_VERSION } from '../utils/version';
import { initWorkspaceCommand } from './workspace';
import { initExportCommand } from './export';

export function createProgram(): Command {
  const program = new Command();

  program
    .version(CLI_VERSION)
    .name(THENEO_CLI_APP)
    .description('A CLI for the Theneo application');
  return program;
}

export function initializeProgram() {
  const program = createProgram();
  initLogin(program);
  initProjectCommand(program);
  initWorkspaceCommand(program);
  initExportCommand(program);
  return program;
}
