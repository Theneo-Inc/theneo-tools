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

describe('mdx-malformed-tag rule (fixtures)', () => {
  const errorCases = ['malformed-open', 'malformed-close', 'malformed-quote'];

  it.each(errorCases)(
    '%s reports a malformed-tag error and exits 1',
    fixture => {
      const findings = audit(fixture);

      expect(ruleIds(findings)).toEqual(['mdx-malformed-tag']);
      expect(findings[0]?.severity).toBe('error');
      expect(findings[0]?.line).toBeGreaterThan(0);
      expect(exitCode(findings)).toBe(1);
    }
  );

  it('does not flag generics, comparisons, or code (no false positives)', () => {
    const findings = audit('malformed-safe');

    expect(findings).toEqual([]);
    expect(exitCode(findings)).toBe(0);
  });

  it('a real widget-rich project stays clean', () => {
    const findings = audit('valid-widgets').filter(
      f => f.rule === 'mdx-malformed-tag'
    );

    expect(findings).toEqual([]);
  });
});
