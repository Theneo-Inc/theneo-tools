import fs from 'fs';
import path from 'path';

export type SourcePlatform =
  | 'mintlify'
  | 'docusaurus'
  | 'mkdocs'
  | 'gitbook'
  | 'markdown'
  | 'unknown';

export interface SourceSummary {
  platform: SourcePlatform;
  /** Human-readable name, e.g. "GitBook". */
  label: string;
  /** Number of .md and .mdx files found. */
  markdownFiles: number;
}

const LABELS = new Map<SourcePlatform, string>([
  ['mintlify', 'Mintlify'],
  ['docusaurus', 'Docusaurus'],
  ['mkdocs', 'MkDocs'],
  ['gitbook', 'GitBook'],
  ['markdown', 'plain Markdown'],
  ['unknown', 'unknown'],
]);

const SKIPPED_NAMES = new Set(['node_modules']);
const MARKDOWN_EXTENSIONS = new Set(['.md', '.mdx']);
// Navigation files usually sit at the root or one folder down (docs/, website/).
const MARKER_DEPTH = 2;

interface ScanState {
  markdownFiles: number;
  markers: Set<SourcePlatform>;
}

function isMintlifyConfig(filePath: string): boolean {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return (
      typeof parsed === 'object' && parsed !== null && 'navigation' in parsed
    );
  } catch {
    return false;
  }
}

function markerFor(name: string, filePath: string): SourcePlatform | undefined {
  if (name === 'mint.json') {
    return 'mintlify';
  }
  if (name === 'docs.json') {
    return isMintlifyConfig(filePath) ? 'mintlify' : undefined;
  }
  if (/^docusaurus\.config\.(js|ts|mjs|cjs)$/.test(name)) {
    return 'docusaurus';
  }
  if (name === 'mkdocs.yml' || name === 'mkdocs.yaml') {
    return 'mkdocs';
  }
  if (name === 'SUMMARY.md' || name === '.gitbook.yaml') {
    return 'gitbook';
  }
  return undefined;
}

function scanFile(
  name: string,
  filePath: string,
  depth: number,
  state: ScanState
): void {
  if (MARKDOWN_EXTENSIONS.has(path.extname(name).toLowerCase())) {
    state.markdownFiles += 1;
  }
  if (depth <= MARKER_DEPTH) {
    const marker = markerFor(name, filePath);
    if (marker) {
      state.markers.add(marker);
    }
  }
}

function scan(
  directory: string,
  depth: number,
  skipped: Set<string>,
  state: ScanState
): void {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const isSkipped =
        entry.name.startsWith('.') ||
        SKIPPED_NAMES.has(entry.name) ||
        skipped.has(entryPath);
      if (!isSkipped) {
        scan(entryPath, depth + 1, skipped, state);
      }
    } else if (entry.isFile()) {
      scanFile(entry.name, entryPath, depth, state);
    }
  }
}

// Most specific first: a Docusaurus or MkDocs site can also contain a SUMMARY.md.
const PRIORITY: SourcePlatform[] = [
  'mintlify',
  'docusaurus',
  'mkdocs',
  'gitbook',
];

/** "1 Markdown file", "86 Markdown files". */
export function formatMarkdownCount(markdownFiles: number): string {
  return `${markdownFiles} Markdown ${markdownFiles === 1 ? 'file' : 'files'}`;
}

/**
 * Look at a docs folder without changing it: which platform it was written
 * for (from its navigation file) and how many Markdown pages it holds.
 * Hidden folders, node_modules (at any depth) and `skipDirs` are not scanned.
 */
export function inspectSource(
  dir: string,
  skipDirs: string[] = []
): SourceSummary {
  const root = path.resolve(dir);
  const skipped = new Set(skipDirs.map(skipDir => path.resolve(root, skipDir)));

  const state: ScanState = { markdownFiles: 0, markers: new Set() };
  scan(root, 1, skipped, state);

  const detected = PRIORITY.find(platform => state.markers.has(platform));
  const fallback: SourcePlatform =
    state.markdownFiles > 0 ? 'markdown' : 'unknown';
  const platform = detected ?? fallback;

  return {
    platform,
    label: LABELS.get(platform) ?? platform,
    markdownFiles: state.markdownFiles,
  };
}
