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

describe('Tier 2 tab rules (fixtures)', () => {
  it('valid project (now with tabs + markers) still produces zero findings', () => {
    const findings = audit('valid');

    expect(findings).toEqual([]);
    expect(exitCode(findings)).toBe(0);
  });

  const errorCases: Array<[string, string]> = [
    ['tab-marker-bad', 'index-tab-marker'],
    ['slug-in-two-tabs', 'section-in-exactly-one-tab'],
    ['tab-missing-section', 'tab-sections-resolve'],
  ];

  it.each(errorCases)('%s reports error %s and exits 1', (fixture, rule) => {
    const findings = audit(fixture);

    expect(ruleIds(findings)).toEqual([rule]);
    expect(findings[0]?.severity).toBe('error');
    expect(exitCode(findings)).toBe(1);
  });

  it('tab-icon-xor is a warning and keeps exit 0', () => {
    const findings = audit('tab-icon-xor');

    expect(ruleIds(findings)).toEqual(['tab-icon-xor-svg']);
    expect(findings[0]?.severity).toBe('warning');
    expect(exitCode(findings)).toBe(0);
  });
});
