import { Command } from 'commander';
import { hasErrors } from '../../core/audit';
import { runAudit } from '../../core/audit/runAudit';
import { printHuman, printJson } from '../../core/audit/report';
import { tryCatch } from '../../utils/exception';

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
    .action(
      tryCatch((options: AuditOptions) => {
        const findings = runAudit(options.dir);

        if (options.json) {
          printJson(findings);
        } else {
          printHuman(findings);
        }

        if (hasErrors(findings)) {
          process.exit(1);
        }
      })
    );
}
