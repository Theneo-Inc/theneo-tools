import fs from 'fs';
import path from 'path';

export type AuditSeverity = 'error' | 'warning';

export interface AuditFinding {
  severity: AuditSeverity;
  file: string;
  line?: number;
  rule: string;
  message: string;
}

interface TabManifest {
  title?: unknown;
  slug?: unknown;
  sections?: unknown;
  iconUrl?: unknown;
  svgCode?: unknown;
}

interface TheneoManifest {
  id?: unknown;
  name?: unknown;
  sections?: unknown;
  tabs?: unknown;
}

interface ManifestSection {
  slug: string;
  folder: string;
}

interface JsonReadResult<T> {
  value?: T;
  error?: string;
}

const REQUIRED_MANIFEST_FIELDS = ['id', 'name', 'sections', 'tabs'];
const REQUIRED_SECTION_FIELDS = [
  'endpoints',
  'request',
  'responses',
  'showBaseUrl',
  'showLanguageBox',
  'showRequestDescription',
  'showResponseDescription',
  'errorCodes',
  'statusCodes',
  'dataExample',
  'endpointSummary',
];
const HTTP_METHODS = new Set([
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'TRACE',
]);

function toRelativeFile(projectDir: string, filePath: string): string {
  const relative = path.relative(projectDir, filePath);
  return relative.length > 0 ? relative.split(path.sep).join('/') : '.';
}

function addFinding(
  findings: AuditFinding[],
  severity: AuditSeverity,
  file: string,
  rule: string,
  message: string,
  line?: number
): void {
  findings.push({ severity, file, rule, message, ...(line ? { line } : {}) });
}

function readJsonFile<T>(filePath: string): JsonReadResult<T> {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { value: JSON.parse(content) as T };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { error: 'contains malformed JSON' };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'could not be read' };
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function flattenManifestSections(
  sections: unknown,
  parentFolder = ''
): ManifestSection[] {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections.flatMap((section: unknown): ManifestSection[] => {
    if (!isObject(section) || typeof section.slug !== 'string') {
      return [];
    }

    const folder = parentFolder
      ? path.join(parentFolder, section.slug)
      : section.slug;

    return [
      { slug: section.slug, folder },
      ...flattenManifestSections(section.children, folder),
    ];
  });
}

function getSectionFolders(projectDir: string): string[] {
  if (!fs.existsSync(projectDir)) {
    return [];
  }

  const folders: string[] = [];
  const walk = (dir: string): void => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const folderPath = path.join(dir, entry.name);
      folders.push(toRelativeFile(projectDir, folderPath));
      walk(folderPath);
    }
  };

  walk(projectDir);
  return folders;
}

function validateManifest(
  projectDir: string,
  manifestPath: string,
  findings: AuditFinding[]
): TheneoManifest | undefined {
  if (!fs.existsSync(manifestPath)) {
    addFinding(
      findings,
      'error',
      'theneo.json',
      'manifest.missing',
      'theneo.json is missing at the project root. Add a manifest with id, name, sections, and tabs.'
    );
    return undefined;
  }

  const manifest = readJsonFile<TheneoManifest>(manifestPath);
  if (!manifest.value) {
    addFinding(
      findings,
      'error',
      'theneo.json',
      'manifest.invalid-json',
      `theneo.json ${manifest.error}. Fix the JSON syntax.`
    );
    return undefined;
  }

  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (!(field in manifest.value)) {
      addFinding(
        findings,
        'error',
        'theneo.json',
        'manifest.required-field',
        `theneo.json is missing required field \`${field}\`. Add \`${field}\` to the root manifest.`
      );
    }
  }

  if (!Array.isArray(manifest.value.sections)) {
    addFinding(
      findings,
      'error',
      'theneo.json',
      'manifest.sections',
      '`sections` must be an array. Export or edit the manifest so sections is an array.'
    );
  }

  if (!Array.isArray(manifest.value.tabs)) {
    addFinding(
      findings,
      'error',
      'theneo.json',
      'manifest.tabs',
      '`tabs` must be an array. Use an empty array when the project has no tabs.'
    );
  }

  if (fs.existsSync(path.join(projectDir, 'index.md'))) {
    addFinding(
      findings,
      'error',
      'index.md',
      'root.index',
      'index.md must not live directly at the project root. Move page content into a section folder.'
    );
  }

  return manifest.value;
}

function validateSectionJson(
  projectDir: string,
  folder: string,
  findings: AuditFinding[]
): void {
  const sectionJsonPath = path.join(projectDir, folder, 'section.json');
  const relativeSectionJson = `${folder}/section.json`;
  const sectionJson = readJsonFile<Record<string, unknown>>(sectionJsonPath);

  if (!sectionJson.value) {
    addFinding(
      findings,
      'error',
      relativeSectionJson,
      'section-json.invalid-json',
      `${relativeSectionJson} ${sectionJson.error}. Fix the JSON syntax.`
    );
    return;
  }

  for (const field of REQUIRED_SECTION_FIELDS) {
    if (!(field in sectionJson.value)) {
      addFinding(
        findings,
        'error',
        relativeSectionJson,
        'section-json.required-field',
        `${relativeSectionJson} is missing \`${field}\`. Add the expected section metadata key.`
      );
    }
  }

  const endpoints = sectionJson.value.endpoints;
  if (isObject(endpoints) && typeof endpoints.method === 'string') {
    const method = endpoints.method.trim();
    if (method.length > 0 && !HTTP_METHODS.has(method.toUpperCase())) {
      addFinding(
        findings,
        'error',
        relativeSectionJson,
        'section-json.http-method',
        `endpoints.method in ${relativeSectionJson} must be a valid HTTP verb. Use GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, or TRACE.`
      );
    }
  }
}

function validateSectionFolders(
  projectDir: string,
  sections: ManifestSection[],
  findings: AuditFinding[]
): void {
  const declaredFolders = new Set(
    sections.map((section) => section.folder.split(path.sep).join('/'))
  );
  const diskFolders = getSectionFolders(projectDir);
  const diskFolderSet = new Set(diskFolders);

  for (const section of sections) {
    const folder = section.folder.split(path.sep).join('/');

    if (!diskFolderSet.has(folder)) {
      addFinding(
        findings,
        'error',
        'theneo.json',
        'section.orphan-manifest',
        `Section \`${section.slug}\` points to missing folder \`${folder}/\`. Create the folder or remove the section from theneo.json.`
      );
      continue;
    }

    const actualFolderName = path.basename(folder);
    if (actualFolderName !== section.slug) {
      addFinding(
        findings,
        'error',
        'theneo.json',
        'section.slug-folder',
        `Section slug \`${section.slug}\` must match its folder name \`${actualFolderName}\`. Rename the folder or update theneo.json.`
      );
    }

    for (const requiredFile of ['index.md', 'section.json']) {
      const requiredPath = path.join(projectDir, folder, requiredFile);
      if (!fs.existsSync(requiredPath)) {
        addFinding(
          findings,
          'error',
          `${folder}/${requiredFile}`,
          'section.required-file',
          `${requiredFile} missing in \`${folder}/\`. Add ${requiredFile} to the section folder.`
        );
      }
    }

    if (fs.existsSync(path.join(projectDir, folder, 'section.json'))) {
      validateSectionJson(projectDir, folder, findings);
    }
  }

  for (const folder of diskFolders) {
    if (!declaredFolders.has(folder)) {
      addFinding(
        findings,
        'warning',
        folder,
        'section.orphan-folder',
        `Folder \`${folder}/\` is not declared in theneo.json. Add it to sections or remove the folder.`
      );
    }
  }
}

function getTabs(manifest: TheneoManifest): TabManifest[] {
  return Array.isArray(manifest.tabs) ? (manifest.tabs as TabManifest[]) : [];
}

function validateTabs(
  manifest: TheneoManifest,
  sections: ManifestSection[],
  findings: AuditFinding[],
  projectDir: string
): void {
  const tabs = getTabs(manifest);
  if (tabs.length === 0) {
    return;
  }

  const declaredSlugs = new Set(sections.map((section) => section.slug));
  const tabSlugs = new Set<string>();
  const sectionTabCounts = new Map<string, string[]>();

  for (const tab of tabs) {
    const title = typeof tab.title === 'string' ? tab.title.trim() : '';
    const slug = typeof tab.slug === 'string' ? tab.slug.trim() : '';

    if (!title) {
      addFinding(
        findings,
        'error',
        'theneo.json',
        'tab.required-title',
        'Every tab needs a non-empty title. Add a title to the tab in theneo.json.'
      );
    }

    if (!slug) {
      addFinding(
        findings,
        'error',
        'theneo.json',
        'tab.required-slug',
        'Every tab needs a non-empty slug. Add a slug to the tab in theneo.json.'
      );
    } else {
      tabSlugs.add(slug);
    }

    const iconUrl = typeof tab.iconUrl === 'string' ? tab.iconUrl.trim() : '';
    const svgCode = typeof tab.svgCode === 'string' ? tab.svgCode.trim() : '';
    if (iconUrl && svgCode) {
      addFinding(
        findings,
        'warning',
        'theneo.json',
        'tab.icon-conflict',
        `Tab \`${slug || '(missing slug)'}\` sets both iconUrl and svgCode. Keep only one icon source.`
      );
    }

    if (!Array.isArray(tab.sections)) {
      addFinding(
        findings,
        'error',
        'theneo.json',
        'tab.sections',
        `Tab \`${slug || '(missing slug)'}\` must have a sections array. Add \`sections: []\` or list section slugs.`
      );
      continue;
    }

    for (const sectionSlug of tab.sections) {
      if (typeof sectionSlug !== 'string') {
        continue;
      }

      const existing = sectionTabCounts.get(sectionSlug) ?? [];
      existing.push(slug);
      sectionTabCounts.set(sectionSlug, existing);

      if (!declaredSlugs.has(sectionSlug)) {
        addFinding(
          findings,
          'error',
          'theneo.json',
          'tab.unknown-section',
          `Tab \`${slug}\` references unknown section \`${sectionSlug}\`. Add the section to theneo.json or remove it from the tab.`
        );
      }
    }
  }

  for (const section of sections) {
    const tabMatches = sectionTabCounts.get(section.slug) ?? [];
    if (tabMatches.length === 0) {
      addFinding(
        findings,
        'error',
        'theneo.json',
        'tab.section-membership',
        `Section \`${section.slug}\` is not assigned to any tab. Add it to exactly one tab's sections array.`
      );
    } else if (tabMatches.length > 1) {
      addFinding(
        findings,
        'error',
        'theneo.json',
        'tab.section-membership',
        `Section \`${section.slug}\` appears in multiple tabs (${tabMatches.join(', ')}). Keep it in exactly one tab.`
      );
    }
  }

  validateTabMarkers(tabSlugs, sections, findings, projectDir);
}

function findTabMarkerLine(
  content: string
): { line: number; slug: string } | undefined {
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index]?.match(
      /^\s*<!--\s*tab:([a-zA-Z0-9-_]+)\s*-->\s*$/
    );
    if (match?.[1]) {
      return { line: index + 1, slug: match[1] };
    }
  }
  return undefined;
}

function findFirstHeadingLine(content: string): number | undefined {
  const lines = content.split(/\r?\n/);
  const index = lines.findIndex((line) => /^#{1,6}\s/.test(line));
  return index >= 0 ? index + 1 : undefined;
}

function validateTabMarkers(
  tabSlugs: Set<string>,
  sections: ManifestSection[],
  findings: AuditFinding[],
  projectDir: string
): void {
  for (const section of sections) {
    const relativeIndex = `${section.folder.split(path.sep).join('/')}/index.md`;
    const absoluteIndex = path.join(projectDir, relativeIndex);
    if (!fs.existsSync(absoluteIndex)) {
      continue;
    }

    const content = fs.readFileSync(absoluteIndex, 'utf8');
    const marker = findTabMarkerLine(content);
    const firstHeading = findFirstHeadingLine(content);

    if (!marker) {
      addFinding(
        findings,
        'error',
        relativeIndex,
        'tab.marker',
        `${relativeIndex} is missing a tab marker. Add \`<!-- tab:slug -->\` before the first heading.`
      );
      continue;
    }

    if (!tabSlugs.has(marker.slug)) {
      addFinding(
        findings,
        'error',
        relativeIndex,
        'tab.marker',
        `Tab marker \`${marker.slug}\` in ${relativeIndex} does not match a tab in theneo.json. Use one of: ${Array.from(tabSlugs).join(', ')}.`,
        marker.line
      );
    }

    if (firstHeading && marker.line > firstHeading) {
      addFinding(
        findings,
        'error',
        relativeIndex,
        'tab.marker',
        `Tab marker in ${relativeIndex} appears after the first heading. Move it before any heading.`,
        marker.line
      );
    } else if (marker.line !== 1) {
      addFinding(
        findings,
        'warning',
        relativeIndex,
        'tab.marker-position',
        `Tab marker in ${relativeIndex} is not at the very top. Move it to line 1 for consistency.`,
        marker.line
      );
    }
  }
}

export function auditProject(projectDir: string): AuditFinding[] {
  const resolvedProjectDir = path.resolve(projectDir);
  const findings: AuditFinding[] = [];
  const manifestPath = path.join(resolvedProjectDir, 'theneo.json');
  const manifest = validateManifest(resolvedProjectDir, manifestPath, findings);

  if (!manifest) {
    return findings;
  }

  const sections = flattenManifestSections(manifest.sections);
  validateSectionFolders(resolvedProjectDir, sections, findings);
  validateTabs(manifest, sections, findings, resolvedProjectDir);

  return findings;
}
