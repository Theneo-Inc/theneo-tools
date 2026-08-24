import chalk from 'chalk';
import { Finding } from './finding';

export function printHuman(findings: readonly Finding[]): void {
  if (findings.length === 0) {
    console.log(chalk.green('✔ No problems found.'));
    return;
  }

  for (const finding of findings) {
    const tag =
      finding.severity === 'error'
        ? chalk.red('error')
        : chalk.yellow('warning');
    const location = finding.line
      ? `${finding.file}:${finding.line}`
      : finding.file;
    console.log(
      `${tag} ${chalk.dim(location)}  ${finding.message} ${chalk.dim(
        `(${finding.rule})`
      )}`
    );
  }

  const errors = findings.filter(f => f.severity === 'error').length;
  const warnings = findings.filter(f => f.severity === 'warning').length;
  console.log(
    `\n${chalk.dim(
      `${findings.length} problem(s): ${errors} error(s), ${warnings} warning(s)`
    )}`
  );
}

export function printJson(findings: readonly Finding[]): void {
  console.log(JSON.stringify(findings));
}
