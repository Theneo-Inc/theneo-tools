import fs from 'fs';
import os from 'os';
import path from 'path';
import { removePreviousExportFiles } from '../../src/commands/export';

// Deciding when NOT to prune is the risky half: a partial export must never
// delete the parts it did not cover.

const OTHER_TAB_PAGE = 'other-tab-page';
const INDEX_MD = 'index.md';

let directory: string;

const SECTION_CONTENTS = [
  { fileName: 'theneo.json' },
  { fileName: `introduction/${INDEX_MD}` },
];

const seedWithStalePage = (): void => {
  SECTION_CONTENTS.forEach(({ fileName }) => {
    const target = path.join(directory, fileName);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, 'x');
  });
  fs.mkdirSync(path.join(directory, OTHER_TAB_PAGE), { recursive: true });
  fs.writeFileSync(path.join(directory, OTHER_TAB_PAGE, INDEX_MD), 'x');
};

const stalePageExists = (): boolean =>
  fs.existsSync(path.join(directory, OTHER_TAB_PAGE, INDEX_MD));

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'theneo-clean-'));
  seedWithStalePage();
});

afterEach(() => {
  fs.rmSync(directory, { recursive: true, force: true });
});

describe('removePreviousExportFiles', () => {
  it('prunes a full export', () => {
    const removed = removePreviousExportFiles(
      { dir: directory, clean: true, tab: undefined },
      SECTION_CONTENTS
    );

    expect(removed).toEqual([path.join(OTHER_TAB_PAGE, INDEX_MD)]);
    expect(stalePageExists()).toBe(false);
  });

  it('prunes nothing for a tab export, which covers only part of the project', () => {
    const removed = removePreviousExportFiles(
      { dir: directory, clean: true, tab: 'guides-tab' },
      SECTION_CONTENTS
    );

    expect(removed).toEqual([]);
    expect(stalePageExists()).toBe(true);
  });

  it('prunes nothing when the caller passed --no-clean', () => {
    const removed = removePreviousExportFiles(
      { dir: directory, clean: false, tab: undefined },
      SECTION_CONTENTS
    );

    expect(removed).toEqual([]);
    expect(stalePageExists()).toBe(true);
  });
});
