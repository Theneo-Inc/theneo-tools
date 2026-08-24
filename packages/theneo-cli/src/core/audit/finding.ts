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
