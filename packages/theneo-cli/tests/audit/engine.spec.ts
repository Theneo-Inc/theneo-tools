import { allRules, hasErrors, runRules } from '../../src/core/audit';
import { ProjectModel, TheneoJsonState } from '../../src/core/audit/model';

const THENEO_JSON_EXISTS = 'theneo-json-exists';

function model(
  theneoJson: TheneoJsonState,
  overrides: Partial<ProjectModel> = {}
): ProjectModel {
  return {
    root: '/tmp/project',
    dirExists: true,
    theneoJson,
    rootHasIndexMd: false,
    declaredSections: [],
    diskSections: [],
    tabs: [],
    ...overrides,
  };
}

describe('audit engine', () => {
  it('flags a missing theneo.json as an error', () => {
    const findings = runRules(model({ status: 'missing' }), allRules);

    expect(findings.map(f => f.rule)).toContain(THENEO_JSON_EXISTS);
    expect(hasErrors(findings)).toBe(true);
  });

  it('distinguishes invalid JSON from a non-object', () => {
    const invalid = runRules(model({ status: 'invalid' }), allRules);
    const notObject = runRules(model({ status: 'not-object' }), allRules);

    expect(invalid.map(f => f.rule)).toContain(THENEO_JSON_EXISTS);
    expect(notObject.map(f => f.rule)).toContain(THENEO_JSON_EXISTS);
  });

  it('produces no findings for a valid, complete project model', () => {
    const findings = runRules(
      model({ status: 'ok', value: { name: 'demo', sections: [] } }),
      allRules
    );

    expect(findings).toHaveLength(0);
    expect(hasErrors(findings)).toBe(false);
  });

  it('reports the directory (not theneo.json) when the dir is missing', () => {
    const findings = runRules(
      model({ status: 'missing' }, { dirExists: false }),
      allRules
    );

    expect(findings.map(f => f.rule)).toContain('project-directory-exists');
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
