import fs from 'fs';
import os from 'os';
import path from 'path';
import { runAudit } from '../../src/core/audit/runAudit';
import { pruneStaleExportFiles } from '../../src/utils/file';

// The reported workflow: export, audit (clean), re-import, export again, audit.
// The second export wrote over the first without removing what the project no
// longer has, so audit then reported pages nothing declares.

let directory: string;

const write = (relativePath: string, content: string): void => {
  const target = path.join(directory, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};

/** What the server returns for this project, after a page was deleted in Theneo. */
const THENEO_JSON_FILE = 'theneo.json';
const INDEX_MD = 'index.md';
const SECTION_JSON = 'section.json';
const REMOVED_PAGE = 'removed-page';

const EXPORTED = [
  THENEO_JSON_FILE,
  `introduction/${INDEX_MD}`,
  `introduction/${SECTION_JSON}`,
  `guides/${INDEX_MD}`,
  `guides/${SECTION_JSON}`,
  `guides/authentication/${INDEX_MD}`,
  `guides/authentication/${SECTION_JSON}`,
];

const THENEO_JSON = {
  id: 'project-1',
  name: 'demo',
  lastExport: '2026-09-28T00:00:00.000Z',
  baseUrl: 'https://api.example.com',
  sections: [
    { name: 'Introduction', slug: 'introduction', children: [] },
    {
      name: 'Guides',
      slug: 'guides',
      children: [
        { name: 'Authentication', slug: 'guides/authentication', children: [] },
      ],
    },
  ],
  tabs: [],
  isSinglePage: false,
};

const writeExport = (): void => {
  write(THENEO_JSON_FILE, JSON.stringify(THENEO_JSON, null, 2));
  EXPORTED.filter(name => name !== THENEO_JSON_FILE).forEach(name =>
    write(name, name.endsWith('.json') ? '{}' : '# page\n')
  );
};

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'theneo-round-trip-'));
});

afterEach(() => {
  fs.rmSync(directory, { recursive: true, force: true });
});

/** Audit's name for a folder on disk that theneo.json does not declare. */
const orphanFindings = (): unknown[] =>
  runAudit(directory).filter(
    finding => finding.rule === 'orphan-on-disk-undeclared'
  );

describe('exporting over a previous export', () => {
  it('reports nothing when the directory was empty', () => {
    writeExport();

    expect(runAudit(directory)).toEqual([]);
  });

  it('reports a deleted page that is still on disk', () => {
    writeExport();
    write(`${REMOVED_PAGE}/${INDEX_MD}`, '# gone\n');
    write(`${REMOVED_PAGE}/${SECTION_JSON}`, '{}');

    expect(orphanFindings()).toEqual([
      expect.objectContaining({
        file: 'removed-page',
        rule: 'orphan-on-disk-undeclared',
      }),
    ]);
  });

  it('reports nothing again once the stale page is pruned', () => {
    writeExport();
    write(`${REMOVED_PAGE}/${INDEX_MD}`, '# gone\n');
    write(`${REMOVED_PAGE}/${SECTION_JSON}`, '{}');

    const removed = pruneStaleExportFiles(directory, EXPORTED);

    expect(removed.length).toBe(2);
    expect(runAudit(directory)).toEqual([]);
  });
});
