import fs from 'fs';
import path from 'path';
import { isJsonObject } from './json';
import {
  DeclaredSection,
  DiskSection,
  ProjectModel,
  SectionDir,
  TheneoJsonState,
} from './model';

const THENEO_JSON = 'theneo.json';
const INDEX_MD = 'index.md';
const SECTION_JSON = 'section.json';
const SKIP_DIRS = new Set(['node_modules']);

export function loadProject(dir: string): ProjectModel {
  const root = path.resolve(dir);
  const dirExists = isDirectory(root);
  const theneoJson: TheneoJsonState = dirExists
    ? readJsonFile(path.join(root, THENEO_JSON))
    : { status: 'missing' };

  return {
    root,
    dirExists,
    theneoJson,
    rootHasIndexMd: dirExists && fs.existsSync(path.join(root, INDEX_MD)),
    declaredSections:
      theneoJson.status === 'ok'
        ? flattenDeclaredSections(root, theneoJson.value)
        : [],
    diskSections: theneoJson.status === 'ok' ? walkDiskSections(root) : [],
  };
}

function isDirectory(target: string): boolean {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
}

function readJsonFile(filePath: string): TheneoJsonState {
  if (!fs.existsSync(filePath)) {
    return { status: 'missing' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { status: 'invalid' };
  }

  if (!isJsonObject(parsed)) {
    return { status: 'not-object' };
  }
  return { status: 'ok', value: parsed };
}

function flattenDeclaredSections(
  root: string,
  config: Record<string, unknown>
): DeclaredSection[] {
  const sections = config['sections'];
  const result: DeclaredSection[] = [];
  if (Array.isArray(sections)) {
    collectSections(root, sections, result);
  }
  return result;
}

function collectSections(
  root: string,
  nodes: unknown[],
  result: DeclaredSection[]
): void {
  for (const node of nodes) {
    if (!isJsonObject(node)) {
      continue;
    }
    const children = node['children'];
    const slug = node['slug'];
    if (typeof slug === 'string' && slug.trim() !== '') {
      const hasChildren = Array.isArray(children) && children.length > 0;
      result.push(buildDeclaredSection(root, slug, node['name'], hasChildren));
    }
    if (Array.isArray(children)) {
      collectSections(root, children, result);
    }
  }
}

function buildDeclaredSection(
  root: string,
  slug: string,
  name: unknown,
  hasChildren: boolean
): DeclaredSection {
  const dir = resolveSectionDir(root, slug);
  const base = dir ? path.join(root, ...dir.relPath.split('/')) : undefined;
  return {
    slug,
    ...(typeof name === 'string' ? { name } : {}),
    hasChildren,
    dir,
    hasIndexMd: base !== undefined && fs.existsSync(path.join(base, INDEX_MD)),
    hasSectionJson:
      base !== undefined && fs.existsSync(path.join(base, SECTION_JSON)),
  };
}

function resolveSectionDir(root: string, slug: string): SectionDir | undefined {
  const segments = slug.split('/').filter(segment => segment.length > 0);
  if (segments.length === 0) {
    return undefined;
  }

  let currentAbs = root;
  const parts: string[] = [];
  let exact = true;
  for (const segment of segments) {
    const match = matchSubdirectory(currentAbs, segment);
    if (match === undefined) {
      return undefined;
    }
    if (match !== segment) {
      exact = false;
    }
    parts.push(match);
    currentAbs = path.join(currentAbs, match);
  }
  return { relPath: parts.join('/'), exact };
}

function matchSubdirectory(dir: string, segment: string): string | undefined {
  const dirs = readSubdirectories(dir);
  if (dirs.includes(segment)) {
    return segment;
  }
  const lower = segment.toLowerCase();
  return dirs.find(name => name.toLowerCase() === lower);
}

function walkDiskSections(root: string): DiskSection[] {
  const result: DiskSection[] = [];
  walkInto(root, root, result);
  return result;
}

function walkInto(root: string, dir: string, result: DiskSection[]): void {
  for (const name of readSubdirectories(dir)) {
    const full = path.join(dir, name);
    const section = readDiskSection(root, full);
    if (section) {
      result.push(section);
    }
    walkInto(root, full, result);
  }
}

function readSubdirectories(dir: string): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  return entries
    .filter(
      entry =>
        entry.isDirectory() &&
        !entry.name.startsWith('.') &&
        !SKIP_DIRS.has(entry.name)
    )
    .map(entry => entry.name);
}

function readDiskSection(root: string, full: string): DiskSection | undefined {
  const hasIndexMd = fs.existsSync(path.join(full, INDEX_MD));
  const hasSectionJson = fs.existsSync(path.join(full, SECTION_JSON));
  if (!hasIndexMd && !hasSectionJson) {
    return undefined;
  }
  return {
    relPath: toPosix(path.relative(root, full)),
    hasIndexMd,
    hasSectionJson,
    sectionJson: hasSectionJson
      ? readJsonFile(path.join(full, SECTION_JSON))
      : { status: 'missing' },
  };
}

function toPosix(relPath: string): string {
  return relPath.split(path.sep).join('/');
}
