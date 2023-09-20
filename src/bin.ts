#!/usr/bin/env node

import { initializeProgram } from './commands';

function runCli() {
  const program = initializeProgram();
  console.debug(process.argv);
  program.parse(process.argv);

  // If no command is provided, display help
  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

runCli();
