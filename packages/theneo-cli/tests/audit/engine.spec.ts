import { allRules, hasErrors, runRules } from '../../src/core/audit';
import { ProjectModel } from '../../src/core/audit/model';

function model(theneoJson: unknown): ProjectModel {
  return { root: '/tmp/project', theneoJson, sections: [] };
}

describe('audit engine', () => {
  it('flags a missing theneo.json as an error', () => {
    const findings = runRules(model(null), allRules);

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
    expect(findings[0]?.rule).toBe('theneo-json-exists');
    expect(hasErrors(findings)).toBe(true);
  });

  it('produces no findings when theneo.json is present', () => {
    const findings = runRules(model({ name: 'demo' }), allRules);

    expect(findings).toHaveLength(0);
    expect(hasErrors(findings)).toBe(false);
  });

  it('treats warnings-only as non-erroring', () => {
    const warningOnly = [
      {
        severity: 'warning' as const,
        file: 'theneo.json',
        rule: 'demo',
        message: 'smell',
      },
    ];

    expect(hasErrors(warningOnly)).toBe(false);
  });
});
