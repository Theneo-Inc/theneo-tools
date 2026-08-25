import fs from 'fs';
import os from 'os';
import path from 'path';
import { loadProject } from '../../src/core/audit/loader';

const THENEO_JSON = 'theneo.json';

function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'theneo-audit-'));
}

function writeTheneoJson(dir: string, contents: string): void {
  fs.writeFileSync(path.join(dir, THENEO_JSON), contents);
}

describe('loadProject', () => {
  it('reports the directory as missing when it does not exist', () => {
    const model = loadProject('/tmp/theneo-audit-does-not-exist-xyz-123');

    expect(model.dirExists).toBe(false);
  });

  it('marks theneo.json missing when the file is absent', () => {
    const model = loadProject(tempDir());

    expect(model.dirExists).toBe(true);
    expect(model.theneoJson.status).toBe('missing');
    expect(model.sections).toEqual([]);
  });

  it('parses theneo.json when it is a valid object', () => {
    const dir = tempDir();
    writeTheneoJson(dir, JSON.stringify({ name: 'demo' }));

    const model = loadProject(dir);

    expect(model.theneoJson).toEqual({
      status: 'ok',
      value: { name: 'demo' },
    });
  });

  it('marks theneo.json invalid when it is malformed JSON', () => {
    const dir = tempDir();
    writeTheneoJson(dir, '{ not valid json');

    expect(loadProject(dir).theneoJson.status).toBe('invalid');
  });

  it('marks theneo.json not-object when it is valid JSON but not an object', () => {
    const dir = tempDir();
    writeTheneoJson(dir, '[]');

    expect(loadProject(dir).theneoJson.status).toBe('not-object');
  });

  it('treats a literal null theneo.json as not-object, not missing', () => {
    const dir = tempDir();
    writeTheneoJson(dir, 'null');

    expect(loadProject(dir).theneoJson.status).toBe('not-object');
  });

  it('resolves the root to an absolute path', () => {
    expect(path.isAbsolute(loadProject('.').root)).toBe(true);
  });
});
