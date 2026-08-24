import { Command } from 'commander';
import { allRules, hasErrors, runRules } from '../../core/audit';
import { loadProject } from '../../core/audit/loader';
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
      const model = loadProject(options.dir);
      const findings = runRules(model, allRules);

      if (options.json) {
        printJson(findings);
      } else {
        printHuman(findings);
      }

      if (hasErrors(findings)) {
        process.exit(1);
      }
    });
}
