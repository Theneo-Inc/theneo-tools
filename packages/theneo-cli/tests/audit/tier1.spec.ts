import path from 'path';
import { exitCode, Finding } from '../../src/core/audit';
import { runAudit } from '../../src/core/audit/runAudit';

const FIXTURES = path.join(__dirname, 'fixtures');

function audit(name: string): Finding[] {
  return runAudit(path.join(FIXTURES, name));
}

function ruleIds(findings: Finding[]): string[] {
  return findings.map(finding => finding.rule).sort();
}

describe('Tier 1 structure rules (fixtures)', () => {
  it('valid project produces zero findings (no false positives)', () => {
    const findings = audit('valid');

    expect(findings).toEqual([]);
    expect(exitCode(findings)).toBe(0);
  });

  it('valid nested project (bare parent container + empty method) is clean', () => {
    const findings = audit('valid-nested');

    expect(findings).toEqual([]);
    expect(exitCode(findings)).toBe(0);
  });

  const errorCases: Array<[string, string]> = [
    ['missing-section-json', 'section-has-section-json'],
    ['missing-index-md', 'section-has-index-md'],
    ['slug-folder-mismatch', 'section-slug-matches-folder'],
    ['orphan-declared-missing', 'orphan-declared-missing'],
    ['malformed-json', 'section-json-valid'],
    ['root-index-md', 'no-root-index-md'],
    ['bad-http-verb', 'section-json-http-verb'],
    ['missing-required-fields', 'theneo-json-required-fields'],
  ];

  it.each(errorCases)('%s reports error %s and exits 1', (fixture, rule) => {
    const findings = audit(fixture);

    expect(ruleIds(findings)).toEqual([rule]);
    expect(findings[0]?.severity).toBe('error');
    expect(exitCode(findings)).toBe(1);
  });

  it('orphan-on-disk-undeclared is a warning and keeps exit 0', () => {
    const findings = audit('orphan-on-disk-undeclared');

    expect(ruleIds(findings)).toEqual(['orphan-on-disk-undeclared']);
    expect(findings[0]?.severity).toBe('warning');
    expect(exitCode(findings)).toBe(0);
  });
});
