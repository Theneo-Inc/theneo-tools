export type Severity = 'error' | 'warning';

export interface Finding {
  severity: Severity;
  file: string;
  line?: number;
  rule: string;
  message: string;
}

export type RuleFinding = Omit<Finding, 'rule'>;

export function hasErrors(findings: readonly Finding[]): boolean {
  return findings.some(finding => finding.severity === 'error');
}

export function exitCode(findings: readonly Finding[]): number {
  return hasErrors(findings) ? 1 : 0;
}

export function dedupeFindings(findings: readonly Finding[]): Finding[] {
  const seen = new Set<string>();
  const result: Finding[] = [];
  for (const finding of findings) {
    const key = `${finding.severity}|${finding.file}|${finding.line ?? ''}|${finding.rule}|${finding.message}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(finding);
    }
  }
  return result;
}

export function sortFindings(findings: readonly Finding[]): Finding[] {
  return [...findings].sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      (a.line ?? 0) - (b.line ?? 0) ||
      a.rule.localeCompare(b.rule) ||
      a.message.localeCompare(b.message)
  );
}
