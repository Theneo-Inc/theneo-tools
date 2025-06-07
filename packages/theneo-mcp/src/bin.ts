#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import { startMcpServer } from './server';

function runCli(): void {
  const program = new Command();
  program.name('mcp').description('Manage MCP server').version('0.1.0');

  program
    .command('add <projectSlug>')
    .option('-p, --port <port>', 'Server port')
    .option('-m, --mode <mode>', 'Server mode: local or cloud', 'local')
    .action(
      async (
        projectSlug: string,
        options: { port?: string; mode?: string }
      ) => {
        if (!projectSlug) {
          console.error('Invalid project slug.');
          process.exit(1);
        }
        const port = Number(options.port || process.env.PORT || 3000);
        const mode = options.mode || process.env.MCP_MODE || 'local';
        const dir = path.join(process.cwd(), `.mcp-${projectSlug}`);
        try {
          await startMcpServer(projectSlug, dir, port, mode);
        } catch (err: any) {
          console.error('Failed to start MCP server:', err.message);
          process.exit(1);
        }
      }
    );

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

runCli();
