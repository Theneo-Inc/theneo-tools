import path from 'path';
import { auditProject } from '../src/commands/audit/auditor';

const fixturesDir = path.join(__dirname, 'fixtures', 'audit');

function auditFixture(name: string) {
  return auditProject(path.join(fixturesDir, name));
}

describe('auditProject', () => {
  it('returns no findings for a valid project', () => {
    expect(auditFixture('valid')).toEqual([]);
  });

  it('reports a missing section.json file', () => {
    const findings = auditFixture('missing-section-json');
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          file: 'introduction/section.json',
          rule: 'section.required-file',
        }),
      ])
    );
  });

  it('reports slug/folder mismatches as missing manifest folders and undeclared disk folders', () => {
    const findings = auditFixture('slug-folder-mismatch');
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          rule: 'section.orphan-manifest',
        }),
        expect.objectContaining({
          severity: 'warning',
          file: 'getting-started',
          rule: 'section.orphan-folder',
        }),
      ])
    );
  });

  it('reports folders on disk that are not declared in theneo.json', () => {
    const findings = auditFixture('orphaned-section');
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'warning',
          file: 'undeclared',
          rule: 'section.orphan-folder',
        }),
      ])
    );
  });

  it('reports malformed theneo.json', () => {
    const findings = auditFixture('malformed-json');
    expect(findings).toEqual([
      expect.objectContaining({
        severity: 'error',
        file: 'theneo.json',
        rule: 'manifest.invalid-json',
      }),
    ]);
  });

  it('reports a bad tab marker', () => {
    const findings = auditFixture('bad-tab-marker');
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          file: 'introduction/index.md',
          line: 1,
          rule: 'tab.marker',
        }),
      ])
    );
  });

  it('reports a section assigned to two tabs', () => {
    const findings = auditFixture('duplicate-tab-section');
    expect(findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          rule: 'tab.section-membership',
        }),
      ])
    );
  });

  it('reports root index.md and invalid section metadata', () => {
    expect(auditFixture('root-index')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          file: 'index.md',
          rule: 'root.index',
        }),
      ])
    );

    expect(auditFixture('bad-section-json')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'error',
          file: 'introduction/section.json',
          rule: 'section-json.http-method',
        }),
      ])
    );
  });
});
