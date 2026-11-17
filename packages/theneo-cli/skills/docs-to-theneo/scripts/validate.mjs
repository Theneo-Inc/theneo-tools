#!/usr/bin/env node
// Content checks on a generated Theneo project, beyond `theneo audit`.
//
//   node validate.mjs <theneo-project-dir> [image-urls.txt]
//
// Prints one line per problem, or "no problems", and exits 1 when there are
// problems. With a second argument it also writes every unique http(s) <Image>
// URL to that file, one per line, for an HTTP check. An <Image> url that is a
// relative path must point at a file that exists. Needs Node 18+, no packages.
import fs from 'node:fs';
import path from 'node:path';

const ALLOWED_TAGS = new Set([
  'Steps',
  'Step',
  'Tabs',
  'TabPanel',
  'CardGroup',
  'Card',
  'Callout',
  'Accordion',
  'AccordionItem',
  'Table',
  'table-row',
  'table-cell',
  'Image',
  'CodeBlock',
  'CodeLine',
  'Video',
  'Divider',
  'MermaidDiagram',
  'title',
  'description',
  'p',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'code',
  'a',
  'br',
]);
const SKIPPED_DIRS = new Set(['node_modules', 'assets']);

const [projectDir, imageListFile] = process.argv.slice(2);
if (!projectDir) {
  console.error(
    'usage: node validate.mjs <theneo-project-dir> [image-urls.txt]'
  );
  process.exit(2);
}

const root = path.resolve(projectDir);
let manifest;
try {
  manifest = JSON.parse(
    fs.readFileSync(path.join(root, 'theneo.json'), 'utf8')
  );
} catch (error) {
  console.error(`cannot read theneo.json in ${root}: ${error.message}`);
  process.exit(2);
}

const sections = new Set();
const collect = nodes => {
  for (const node of nodes ?? []) {
    sections.add(node.slug);
    collect(node.children);
  }
};
collect(manifest.sections);

// The first tab is served at the site root, every other tab under /<tab-slug>/.
const tabs = Array.isArray(manifest.tabs) ? manifest.tabs : [];
const firstTab = tabs[0]?.slug;
const tabOf = new Map();
for (const tab of tabs) {
  for (const top of tab.sections ?? []) {
    tabOf.set(top, tab.slug);
  }
}

const servedUrl = sectionPath => {
  const tab = tabOf.get(sectionPath.split('/')[0]);
  return tab === undefined || tab === firstTab
    ? sectionPath
    : `${tab}/${sectionPath}`;
};
const knownUrls = new Set([...sections].map(servedUrl));

const findIndexFiles = (directory, found = []) => {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.') && !SKIPPED_DIRS.has(entry.name)) {
        findIndexFiles(path.join(directory, entry.name), found);
      }
    } else if (entry.name === 'index.md') {
      found.push(path.join(directory, entry.name));
    }
  }
  return found;
};

const isExternal = href => /^(https?:|mailto:|tel:|#)/.test(href);

const resolveLink = (pageUrl, href) => {
  const parts = pageUrl.split('/').slice(0, -1);
  for (const segment of href.split('#')[0].split('/')) {
    if (segment === '..') {
      parts.pop();
    } else if (segment && segment !== '.') {
      parts.push(segment);
    }
  }
  return parts.join('/');
};

const problems = [];
const imageUrls = new Set();
const localImages = new Set();

for (const indexFile of findIndexFiles(root).sort()) {
  const rel = path
    .relative(root, path.dirname(indexFile))
    .split(path.sep)
    .join('/');
  if (rel === '') {
    continue; // a root index.md is reported by `theneo audit`
  }
  const text = fs.readFileSync(indexFile, 'utf8');
  const pageUrl = servedUrl(rel);

  const hrefs = [
    ...[...text.matchAll(/href="([^"]+)"/g)].map(match => match[1]),
    ...[...text.matchAll(/\]\(([^)\s]+)\)/g)].map(match => match[1]),
  ];
  for (const href of hrefs) {
    if (!isExternal(href) && !knownUrls.has(resolveLink(pageUrl, href))) {
      problems.push(`${rel}: broken link ${href}`);
    }
  }

  if (/^# /m.test(text)) {
    problems.push(`${rel}: H1 in body duplicates the section title`);
  }

  for (const match of text.matchAll(/<Image url="([^"]+)"/g)) {
    const url = match[1];
    const localFile = path.resolve(path.dirname(indexFile), url);
    if (/^https?:/.test(url)) {
      imageUrls.add(url);
    } else if (fs.existsSync(localFile)) {
      localImages.add(localFile);
    } else {
      problems.push(`${rel}: image file not found ${url}`);
    }
  }

  // Attribute JSON and code samples legitimately hold braces and tags.
  const stripped = text
    .replace(/attributes='[^']*'|tableHeader='[^']*'|colSizes='[^']*'/g, '')
    .replace(/<CodeLine>[\s\S]*?<\/CodeLine>/g, '<CodeLine></CodeLine>');

  if (/[{}]|@\//.test(stripped)) {
    problems.push(`${rel}: curly brace or unresolved @/ placeholder`);
  }
  for (const match of stripped.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
    if (/\*\*|`|\]\(/.test(match[1])) {
      problems.push(`${rel}: markdown inside HTML: ${match[1].slice(0, 80)}`);
    }
  }
  for (const match of stripped.matchAll(/<(\/?)([A-Za-z][\w-]*)/g)) {
    if (!ALLOWED_TAGS.has(match[2])) {
      problems.push(`${rel}: unexpected tag <${match[1]}${match[2]}>`);
    }
  }
}

console.log(problems.join('\n') || 'no problems');
if (imageListFile) {
  fs.writeFileSync(imageListFile, [...imageUrls].sort().join('\n') + '\n');
}
console.log(
  `${sections.size} sections, ${imageUrls.size} unique image URLs, ${localImages.size} local image files`
);
process.exit(problems.length > 0 ? 1 : 0);
