import fs from 'fs';
import os from 'os';
import path from 'path';
import { exitCode } from '../../src/core/audit';
import { runAudit } from '../../src/core/audit/runAudit';

function projectDir(theneoJson?: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'theneo-audit-'));
  if (theneoJson !== undefined) {
    fs.writeFileSync(path.join(dir, 'theneo.json'), theneoJson);
  }
  return dir;
}

describe('runAudit + exitCode', () => {
  it('valid project produces no findings and exit code 0', () => {
    const findings = runAudit(projectDir('{"name":"demo","sections":[]}'));

    expect(findings).toHaveLength(0);
    expect(exitCode(findings)).toBe(0);
  });

  it('missing theneo.json produces an error and exit code 1', () => {
    const findings = runAudit(projectDir());

    expect(findings[0]?.rule).toBe('theneo-json-exists');
    expect(exitCode(findings)).toBe(1);
  });

  it('malformed theneo.json is reported as invalid and exit code 1', () => {
    const findings = runAudit(projectDir('{ not valid json'));

    expect(findings[0]?.rule).toBe('theneo-json-exists');
    expect(findings[0]?.message).toMatch(/valid JSON/);
    expect(exitCode(findings)).toBe(1);
  });

  it('nonexistent directory is reported as a directory error and exit code 1', () => {
    const findings = runAudit('/tmp/theneo-audit-nope-xyz-123');

    expect(findings).toHaveLength(1);
    expect(findings[0]?.rule).toBe('project-directory-exists');
    expect(exitCode(findings)).toBe(1);
  });
});
