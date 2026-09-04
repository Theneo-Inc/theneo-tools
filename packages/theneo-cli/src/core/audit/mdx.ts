import { MdxAnalysis, MdxTag, MdxUnbalanced } from './model';

interface RawTag {
  kind: 'open' | 'close' | 'self';
  name: string;
  props: Record<string, string>;
  line: number;
}

const PROP_RE = /([A-Za-z][\w-]*)\s*=\s*('([^']*)'|"([^"]*)")/g;

const WIDGET_NAMES = new Set([
  'Callout',
  'CodeBlock',
  'CodeLine',
  'Card',
  'CardGroup',
  'Steps',
  'Step',
  'Accordion',
  'AccordionItem',
  'Tabs',
  'TabPanel',
  'Table',
  'Image',
  'Video',
  'Divider',
  'MermaidDiagram',
]);

export function parseMdx(content: string): MdxAnalysis {
  const raw = scanTags(content.split(/\r?\n/));
  const tags: MdxTag[] = [];
  const unbalanced: MdxUnbalanced[] = [];
  const stack: number[] = [];

  for (const token of raw) {
    if (token.kind === 'close') {
      const top = stack[stack.length - 1];
      if (top !== undefined && tags.at(top)?.name === token.name) {
        stack.pop();
      } else {
        unbalanced.push({
          name: token.name,
          line: token.line,
          kind: 'unexpected-close',
        });
      }
      continue;
    }

    const parentIndex = stack[stack.length - 1];
    const index = tags.length;
    tags.push({
      name: token.name,
      line: token.line,
      selfClosing: token.kind === 'self',
      props: token.props,
      depth: stack.length,
      ...(parentIndex !== undefined ? { parentIndex } : {}),
    });
    if (token.kind === 'open') {
      stack.push(index);
    }
  }

  for (const index of stack) {
    const tag = tags.at(index);
    if (tag) {
      unbalanced.push({ name: tag.name, line: tag.line, kind: 'unclosed' });
    }
  }

  return { tags, unbalanced };
}

const RAW_WIDGETS = new Set(['CodeBlock', 'CodeLine']);

function scanTags(lines: string[]): RawTag[] {
  const tags: RawTag[] = [];
  let inFence = false;
  let rawCloser: string | undefined;
  for (const [i, line] of lines.entries()) {
    if (rawCloser === undefined) {
      if (isFence(line)) {
        inFence = !inFence;
        continue;
      }
      if (inFence) {
        continue;
      }
    }
    rawCloser = scanLine(line, i + 1, tags, rawCloser);
  }
  return tags;
}

function scanLine(
  line: string,
  lineNo: number,
  out: RawTag[],
  rawCloser: string | undefined
): string | undefined {
  let i = 0;
  let closer = rawCloser;
  while (i < line.length) {
    if (closer !== undefined) {
      const next = skipToClose(line, i, closer, lineNo, out);
      if (next === undefined) {
        return closer;
      }
      i = next;
      closer = undefined;
      continue;
    }
    const step = readTag(line, i, lineNo, out);
    if (step === undefined) {
      return undefined;
    }
    i = step.next;
    closer = step.rawName;
  }
  return closer;
}

function skipToClose(
  line: string,
  from: number,
  closer: string,
  lineNo: number,
  out: RawTag[]
): number | undefined {
  const closeTag = `</${closer}>`;
  const idx = line.indexOf(closeTag, from);
  if (idx === -1) {
    return undefined;
  }
  out.push({ kind: 'close', name: closer, props: {}, line: lineNo });
  return idx + closeTag.length;
}

function readTag(
  line: string,
  from: number,
  lineNo: number,
  out: RawTag[]
): { next: number; rawName: string | undefined } | undefined {
  const lt = line.indexOf('<', from);
  if (lt === -1) {
    return undefined;
  }
  const end = findTagEnd(line, lt);
  if (end === -1) {
    return undefined;
  }
  const next = end + 1;
  const tag = parseInnerTag(line.slice(lt + 1, end), lineNo);
  if (!tag) {
    return { next, rawName: undefined };
  }
  out.push(tag);
  const rawName =
    tag.kind === 'open' && RAW_WIDGETS.has(tag.name) ? tag.name : undefined;
  return { next, rawName };
}

function findTagEnd(line: string, start: number): number {
  let quote = '';
  for (let j = start + 1; j < line.length; j++) {
    const c = line.charAt(j);
    if (quote) {
      if (c === quote) {
        quote = '';
      }
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return j;
    }
  }
  return -1;
}

function parseInnerTag(inner: string, line: number): RawTag | undefined {
  const trimmed = inner.trim();
  if (trimmed === '' || trimmed.startsWith('!')) {
    return undefined;
  }
  if (trimmed.startsWith('/')) {
    const name = firstToken(trimmed.slice(1));
    return isWidgetName(name)
      ? { kind: 'close', name, props: {}, line }
      : undefined;
  }
  const selfClosing = trimmed.endsWith('/');
  const body = selfClosing ? trimmed.slice(0, -1) : trimmed;
  const name = firstToken(body);
  if (!isWidgetName(name)) {
    return undefined;
  }
  return {
    kind: selfClosing ? 'self' : 'open',
    name,
    props: parseProps(body.slice(name.length)),
    line,
  };
}

function firstToken(text: string): string {
  return text.trim().split(/\s/)[0] ?? '';
}

function isWidgetName(name: string): boolean {
  return WIDGET_NAMES.has(name);
}

function parseProps(text: string): Record<string, string> {
  const entries: Array<[string, string]> = [];
  let match: RegExpExecArray | null;
  PROP_RE.lastIndex = 0;
  while ((match = PROP_RE.exec(text)) !== null) {
    const key = match[1];
    if (key !== undefined) {
      entries.push([key, match[3] ?? match[4] ?? '']);
    }
  }
  return Object.fromEntries(entries);
}

function isFence(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('```') || trimmed.startsWith('~~~');
}
