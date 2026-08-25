import { Command } from 'commander';
import { exitCode } from '../../core/audit';
import { runAudit } from '../../core/audit/runAudit';
import { printHuman, printJson } from '../../core/audit/report';

interface AuditOptions {
  dir: string;
  json: boolean | undefined;
}

export function initAuditCommand(program: Command): Command {
  return program
    .command('audit')
    .description(
      'Validate a Theneo documentation project on disk and report structural problems'
    )
    .option('--dir <directory>', 'Project directory to validate', process.cwd())
    .option('--json', 'Output findings as a JSON array (pipeable)')
    .action((options: AuditOptions) => {
      const findings = runAudit(options.dir);

      if (options.json) {
        printJson(findings);
      } else {
        printHuman(findings);
      }

      process.exitCode = exitCode(findings);
    });
}
