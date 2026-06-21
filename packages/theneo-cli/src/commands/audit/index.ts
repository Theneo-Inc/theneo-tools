import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import { auditProject, AuditFinding } from './auditor';
import { tryCatch } from '../../utils/exception';

interface AuditOptions {
  dir?: string;
  json?: boolean;
}

function formatFinding(finding: AuditFinding): string {
  const location = finding.line ? `${finding.file}:${finding.line}` : finding.file;
  const severity =
    finding.severity === 'error'
      ? chalk.red(finding.severity)
      : chalk.yellow(finding.severity);
  return `${severity} ${chalk.cyan(location)} ${chalk.dim(finding.rule)} ${finding.message}`;
}

function printHumanOutput(projectDir: string, findings: AuditFinding[]): void {
  if (findings.length === 0) {
    console.log(
      chalk.green(
        `No audit findings in ${path.relative(process.cwd(), projectDir) || '.'}.`
      )
    );
    return;
  }

  const errors = findings.filter((finding) => finding.severity === 'error')
    .length;
  const warnings = findings.length - errors;

  console.log(
    chalk.bold(`Audit found ${errors} error(s) and ${warnings} warning(s):`)
  );
  for (const finding of findings) {
    console.log(formatFinding(finding));
  }
}

export function initAuditCommand(program: Command): Command {
  return program
    .command('audit')
    .description('Validate a Theneo markdown project on disk')
    .option('--dir <directory>', 'Project directory to audit', '.')
    .option(
      '--json',
      'Emit machine-readable JSON instead of human-readable output',
      false
    )
    .action(
      tryCatch(async (options: AuditOptions) => {
        const projectDir = path.resolve(options.dir ?? '.');
        const findings = auditProject(projectDir);
        const hasErrors = findings.some(
          (finding) => finding.severity === 'error'
        );

        if (options.json) {
          console.log(JSON.stringify(findings, null, 2));
        } else {
          printHumanOutput(projectDir, findings);
        }

        if (hasErrors) {
          process.exit(1);
        }
      })
    );
}
