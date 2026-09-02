import { IndexMarker } from './model';

const MARKER_RE = /<!--\s*tab:\s*([^\s>]+)\s*-->/;

export function parseIndexMarker(content: string): IndexMarker {
  const lines = content.split(/\r?\n/);
  const start = skipFrontmatter(lines);
  const effective = outsideCodeFences(lines, start);
  const firstNonBlank = effective.find(([, line]) => line.trim() !== '');

  for (const [i, line] of effective) {
    const match = MARKER_RE.exec(line);
    if (match) {
      const atTop = firstNonBlank?.[0] === i && line.trim().startsWith('<!--');
      return { present: true, slug: match[1], atTop, line: i + 1 };
    }
  }

  return { present: false, atTop: false };
}

function skipFrontmatter(lines: string[]): number {
  let i = 0;
  while (i < lines.length && (lines.at(i) ?? '').trim() === '') {
    i++;
  }
  if ((lines.at(i) ?? '').trim() !== '---') {
    return 0;
  }
  for (let j = i + 1; j < lines.length; j++) {
    if ((lines.at(j) ?? '').trim() === '---') {
      return j + 1;
    }
  }
  return 0;
}

function outsideCodeFences(
  lines: string[],
  start: number
): Array<[number, string]> {
  const result: Array<[number, string]> = [];
  let inFence = false;
  for (const [i, line] of lines.entries()) {
    if (i < start) {
      continue;
    }
    if (isFence(line)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) {
      result.push([i, line]);
    }
  }
  return result;
}

function isFence(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('```') || trimmed.startsWith('~~~');
}
