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

describe('Tier 3 MDX rules (fixtures)', () => {
  it('a real widget-rich project produces zero findings (no false positives)', () => {
    const findings = audit('valid-widgets');

    expect(findings).toEqual([]);
    expect(exitCode(findings)).toBe(0);
  });

  const errorCases: Array<[string, string]> = [
    ['mdx-bad-json', 'mdx-attributes-json'],
    ['mdx-unbalanced', 'mdx-tags-balanced'],
    ['mdx-tabpanel-orphan', 'mdx-tabpanel-parent'],
    ['mdx-callout-datatype', 'mdx-callout-datatype'],
  ];

  it.each(errorCases)('%s reports error %s and exits 1', (fixture, rule) => {
    const findings = audit(fixture);

    expect(ruleIds(findings)).toEqual([rule]);
    expect(findings[0]?.severity).toBe('error');
    expect(findings[0]?.line).toBeGreaterThan(0);
    expect(exitCode(findings)).toBe(1);
  });

  it('mdx-nesting is a warning with a line number and keeps exit 0', () => {
    const findings = audit('mdx-nesting');

    expect(ruleIds(findings)).toEqual(['mdx-nesting-depth']);
    expect(findings[0]?.severity).toBe('warning');
    expect(findings[0]?.line).toBeGreaterThan(0);
    expect(exitCode(findings)).toBe(0);
  });
});
