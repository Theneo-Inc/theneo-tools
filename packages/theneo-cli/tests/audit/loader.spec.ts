import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadProject } from '../../src/core/audit/loader';

function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'theneo-audit-'));
}

describe('loadProject', () => {
  it('returns theneoJson null when the file is missing', () => {
    const model = loadProject(tempDir());

    expect(model.theneoJson).toBeNull();
    expect(model.sections).toEqual([]);
  });

  it('parses theneo.json when it is present and valid', () => {
    const dir = tempDir();
    fs.writeFileSync(
      path.join(dir, 'theneo.json'),
      JSON.stringify({ name: 'demo' })
    );

    const model = loadProject(dir);

    expect(model.theneoJson).toEqual({ name: 'demo' });
  });

  it('returns null when theneo.json is malformed JSON', () => {
    const dir = tempDir();
    fs.writeFileSync(path.join(dir, 'theneo.json'), '{ not valid json');

    const model = loadProject(dir);

    expect(model.theneoJson).toBeNull();
  });

  it('resolves the root to an absolute path', () => {
    const model = loadProject('.');

    expect(path.isAbsolute(model.root)).toBe(true);
  });
});
