import { allRules, hasErrors, runRules } from '../../src/core/audit';
import { ProjectModel, TheneoJsonState } from '../../src/core/audit/model';

function model(theneoJson: TheneoJsonState, dirExists = true): ProjectModel {
  return { root: '/tmp/project', dirExists, theneoJson, sections: [] };
}

describe('audit engine', () => {
  it('flags a missing theneo.json as an error', () => {
    const findings = runRules(model({ status: 'missing' }), allRules);

    expect(findings).toHaveLength(1);
    expect(findings[0]?.rule).toBe('theneo-json-exists');
    expect(findings[0]?.severity).toBe('error');
    expect(hasErrors(findings)).toBe(true);
  });

  it('distinguishes invalid JSON from a non-object', () => {
    const invalid = runRules(model({ status: 'invalid' }), allRules);
    const notObject = runRules(model({ status: 'not-object' }), allRules);

    expect(invalid[0]?.message).toMatch(/valid JSON/);
    expect(notObject[0]?.message).toMatch(/object/);
  });

  it('produces no findings when theneo.json is a valid object', () => {
    const findings = runRules(
      model({ status: 'ok', value: { name: 'demo' } }),
      allRules
    );

    expect(findings).toHaveLength(0);
    expect(hasErrors(findings)).toBe(false);
  });

  it('reports the directory (not theneo.json) when the dir is missing', () => {
    const findings = runRules(model({ status: 'missing' }, false), allRules);

    expect(findings).toHaveLength(1);
    expect(findings[0]?.rule).toBe('project-directory-exists');
    expect(hasErrors(findings)).toBe(true);
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
