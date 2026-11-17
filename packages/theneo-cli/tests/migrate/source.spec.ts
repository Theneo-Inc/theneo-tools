import fs from 'fs';
import os from 'os';
import path from 'path';
import { inspectSource } from '../../src/core/migrate/source';

let directory: string;

const write = (file: string, content = 'x'): void => {
  const target = path.join(directory, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
};

beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'theneo-migrate-source-'));
});

afterEach(() => {
  fs.rmSync(directory, { recursive: true, force: true });
});

describe('inspectSource', () => {
  it.each([
    ['SUMMARY.md', 'x', 'gitbook', 'GitBook'],
    ['.gitbook.yaml', 'x', 'gitbook', 'GitBook'],
    ['mint.json', '{}', 'mintlify', 'Mintlify'],
    ['docs.json', '{"navigation":{}}', 'mintlify', 'Mintlify'],
    ['docusaurus.config.ts', 'x', 'docusaurus', 'Docusaurus'],
    ['docusaurus.config.js', 'x', 'docusaurus', 'Docusaurus'],
    ['mkdocs.yml', 'x', 'mkdocs', 'MkDocs'],
  ])('recognises %s', (marker, content, platform, label) => {
    write(marker, content);
    write('guide/intro.md');

    const summary = inspectSource(directory);

    expect(summary.platform).toBe(platform);
    expect(summary.label).toBe(label);
  });

  it('finds a navigation file one folder down', () => {
    write('docs/SUMMARY.md');

    expect(inspectSource(directory).platform).toBe('gitbook');
  });

  it('does not take any docs.json for a Mintlify config', () => {
    write('docs.json', '{"pages":[]}');
    write('intro.md');

    expect(inspectSource(directory).platform).toBe('markdown');
  });

  it('prefers the site generator over a stray SUMMARY.md', () => {
    write('docusaurus.config.js');
    write('docs/SUMMARY.md');

    expect(inspectSource(directory).platform).toBe('docusaurus');
  });

  it('calls a folder of pages with no navigation file plain Markdown', () => {
    write('a.md');
    write('nested/b.mdx');

    expect(inspectSource(directory)).toEqual({
      platform: 'markdown',
      label: 'plain Markdown',
      markdownFiles: 2,
    });
  });

  it('reports unknown when there is no Markdown at all', () => {
    write('index.html');

    expect(inspectSource(directory)).toEqual({
      platform: 'unknown',
      label: 'unknown',
      markdownFiles: 0,
    });
  });

  it('counts only the docs, not dependencies, hidden folders or earlier output', () => {
    write('SUMMARY.md');
    write('page.md');
    write('node_modules/pkg/README.md');
    write('website/node_modules/pkg/README.md');
    write('.claude/skills/docs-to-theneo/SKILL.md');
    write('converted_for_theneo/overview/index.md');
    write('theneo_migration/REPORT.md');

    const summary = inspectSource(directory, [
      path.join(directory, 'converted_for_theneo'),
      'theneo_migration',
    ]);

    expect(summary.markdownFiles).toBe(2);
  });
});
