import fs from 'fs';
import os from 'os';
import path from 'path';
import { pruneStaleExportFiles } from '../../src/utils/file';

// Export writes files but never removed them, so a page renamed or deleted in
// Theneo stayed on disk and the next import picked it back up. `theneo audit`
// reported the leftovers as sections nothing declares.

let directory: string;

const write = (relativePath: string, content = 'x'): void => {
  const target = path.join(directory, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};

const exists = (relativePath: string): boolean =>
  fs.existsSync(path.join(directory, relativePath));

const INDEX_MD = 'index.md';
const SECTION_JSON = 'section.json';
const REMOVED_PAGE = 'removed-page';
const REMOVED_PAGE_INDEX = `${REMOVED_PAGE}/${INDEX_MD}`;

/** What the server returns for a two page project. */
const EXPORTED = [
  'theneo.json',
  `introduction/${INDEX_MD}`,
  `introduction/${SECTION_JSON}`,
  `guides/authentication/${INDEX_MD}`,
  `guides/authentication/${SECTION_JSON}`,
];

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'theneo-export-'));
});

afterEach(() => {
  fs.rmSync(directory, { recursive: true, force: true });
});

describe('pruneStaleExportFiles', () => {
  it('removes a page the project no longer has', () => {
    EXPORTED.forEach(name => write(name));
    write(REMOVED_PAGE_INDEX);
    write(`${REMOVED_PAGE}/${SECTION_JSON}`);

    const removed = pruneStaleExportFiles(directory, EXPORTED);

    expect(removed.sort()).toEqual(
      [
        path.join(REMOVED_PAGE, INDEX_MD),
        path.join(REMOVED_PAGE, SECTION_JSON),
      ].sort()
    );
    expect(exists(REMOVED_PAGE)).toBe(false);
    EXPORTED.forEach(name => expect(exists(name)).toBe(true));
  });

  it('removes a page that was renamed, leaving only the new one', () => {
    EXPORTED.forEach(name => write(name));
    write(`guides/authentification/${INDEX_MD}`);

    pruneStaleExportFiles(directory, EXPORTED);

    expect(exists('guides/authentification')).toBe(false);
    expect(exists(`guides/authentication/${INDEX_MD}`)).toBe(true);
  });

  it('removes a stale page nested several levels deep', () => {
    EXPORTED.forEach(name => write(name));
    write(`guides/authentication/oauth/pkce/${INDEX_MD}`);

    pruneStaleExportFiles(directory, EXPORTED);

    expect(exists('guides/authentication/oauth')).toBe(false);
    expect(exists(`guides/authentication/${INDEX_MD}`)).toBe(true);
  });

  it('changes nothing when the directory already matches the export', () => {
    EXPORTED.forEach(name => write(name));

    expect(pruneStaleExportFiles(directory, EXPORTED)).toEqual([]);
    EXPORTED.forEach(name => expect(exists(name)).toBe(true));
  });

  it('leaves files the export does not own alone', () => {
    EXPORTED.forEach(name => write(name));
    write('README.md');
    write('assets/logo.png');
    write('introduction/diagram.png');
    write('hand-written-page.md');

    pruneStaleExportFiles(directory, EXPORTED);

    expect(exists('README.md')).toBe(true);
    expect(exists('assets/logo.png')).toBe(true);
    expect(exists('introduction/diagram.png')).toBe(true);
    expect(exists('hand-written-page.md')).toBe(true);
  });

  it('keeps a directory that still holds something the export does not own', () => {
    EXPORTED.forEach(name => write(name));
    write(REMOVED_PAGE_INDEX);
    write(`${REMOVED_PAGE}/screenshot.png`);

    pruneStaleExportFiles(directory, EXPORTED);

    expect(exists(REMOVED_PAGE_INDEX)).toBe(false);
    expect(exists(`${REMOVED_PAGE}/screenshot.png`)).toBe(true);
  });

  it('never removes the export directory itself', () => {
    write(REMOVED_PAGE_INDEX);

    pruneStaleExportFiles(directory, []);

    expect(fs.existsSync(directory)).toBe(true);
  });

  it('does nothing for a directory that does not exist yet', () => {
    expect(
      pruneStaleExportFiles(path.join(directory, 'missing'), EXPORTED)
    ).toEqual([]);
  });
});
