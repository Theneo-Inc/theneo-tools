import { IndexMarker } from './model';

const MARKER_RE = /<!--\s*tab:\s*([^\s>]+)\s*-->/;

export function parseIndexMarker(content: string): IndexMarker {
  const lines = content.split(/\r?\n/);
  const firstNonBlank = lines.findIndex(line => line.trim() !== '');

  for (const [i, line] of lines.entries()) {
    const match = MARKER_RE.exec(line);
    if (match) {
      const atTop = i === firstNonBlank && line.trim().startsWith('<!--');
      return { present: true, slug: match[1], atTop, line: i + 1 };
    }
  }

  return { present: false, atTop: false };
}
