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
    expect(model.declaredSections).toEqual([]);
  });

  it('parses theneo.json when it is a valid object', () => {
    const dir = tempDir();
    writeTheneoJson(dir, JSON.stringify({ name: 'demo', sections: [] }));

    const model = loadProject(dir);

    expect(model.theneoJson).toEqual({
      status: 'ok',
      value: { name: 'demo', sections: [] },
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

  it('flattens nested declared sections with full-path slugs', () => {
    const dir = tempDir();
    writeTheneoJson(
      dir,
      JSON.stringify({
        name: 'demo',
        sections: [
          {
            name: 'Guides',
            slug: 'guides',
            children: [{ name: 'Auth', slug: 'guides/auth' }],
          },
        ],
      })
    );

    const slugs = loadProject(dir).declaredSections.map(s => s.slug);

    expect(slugs).toEqual(['guides', 'guides/auth']);
  });

  it('discovers on-disk section folders that contain index.md or section.json', () => {
    const dir = tempDir();
    writeTheneoJson(dir, JSON.stringify({ name: 'demo', sections: [] }));
    fs.mkdirSync(path.join(dir, 'intro'));
    fs.writeFileSync(path.join(dir, 'intro', 'index.md'), '# Intro');
    fs.writeFileSync(path.join(dir, 'intro', 'section.json'), '{}');
    fs.mkdirSync(path.join(dir, 'assets'));
    fs.writeFileSync(path.join(dir, 'assets', 'logo.png'), 'x');

    const disk = loadProject(dir).diskSections.map(d => d.relPath);

    expect(disk).toEqual(['intro']);
  });

  it('does not walk the tree when theneo.json is missing', () => {
    const dir = tempDir();
    fs.mkdirSync(path.join(dir, 'intro'));
    fs.writeFileSync(path.join(dir, 'intro', 'section.json'), '{}');

    expect(loadProject(dir).diskSections).toEqual([]);
  });

  it('resolves the root to an absolute path', () => {
    expect(path.isAbsolute(loadProject('.').root)).toBe(true);
  });
});
