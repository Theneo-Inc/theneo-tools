import { MdxAnalysis, MdxMalformed, MdxTag, MdxUnbalanced } from './model';

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
  const lines = content.split(/\r?\n/);
  const raw = scanTags(lines);
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

  return { tags, unbalanced, malformed: scanMalformed(lines) };
}

const RAW_WIDGETS = new Set(['CodeBlock', 'CodeLine']);

function scanContentLines(
  lines: string[],
  onLine: (
    line: string,
    lineNo: number,
    rawCloser: string | undefined
  ) => string | undefined
): void {
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
    rawCloser = onLine(line, i + 1, rawCloser);
  }
}

function scanTags(lines: string[]): RawTag[] {
  const tags: RawTag[] = [];
  scanContentLines(lines, (line, lineNo, closer) =>
    scanLine(line, lineNo, tags, closer)
  );
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

const STRUCTURAL_TAGS = new Set([
  'table-row',
  'table-cell',
  'title',
  'description',
]);
const TAG_NAME_RE = /^[A-Za-z][\w-]*/;

function isRecognizedTag(name: string): boolean {
  return WIDGET_NAMES.has(name) || STRUCTURAL_TAGS.has(name);
}

function scanMalformed(lines: string[]): MdxMalformed[] {
  const out: MdxMalformed[] = [];
  scanContentLines(lines, (line, lineNo, closer) =>
    scanMalformedLine(line, lineNo, out, closer)
  );
  return out;
}

function scanMalformedLine(
  line: string,
  lineNo: number,
  out: MdxMalformed[],
  rawCloser: string | undefined
): string | undefined {
  let i = 0;
  let closer = rawCloser;
  while (i < line.length) {
    if (closer !== undefined) {
      const closeTag = `</${closer}>`;
      const idx = line.indexOf(closeTag, i);
      if (idx === -1) {
        return closer;
      }
      i = idx + closeTag.length;
      closer = undefined;
      continue;
    }
    const lt = line.indexOf('<', i);
    if (lt === -1) {
      return undefined;
    }
    const scan = inspectMalformed(line, lt, lineNo);
    if (scan.malformed) {
      out.push(scan.malformed);
    }
    i = Math.max(scan.next, lt + 1);
    if (scan.rawOpen !== undefined) {
      closer = scan.rawOpen;
    }
  }
  return closer;
}

interface MalformedScan {
  next: number;
  malformed?: MdxMalformed;
  rawOpen?: string;
}

function inspectMalformed(
  line: string,
  lt: number,
  lineNo: number
): MalformedScan {
  const isClose = line.charAt(lt + 1) === '/';
  const nameStart = lt + (isClose ? 2 : 1);
  const nameMatch = TAG_NAME_RE.exec(line.slice(nameStart));
  const name = nameMatch ? nameMatch[0] : '';
  if (!isRecognizedTag(name)) {
    return { next: nameStart + name.length };
  }

  const contentStart = nameStart + name.length;
  const term = scanToTerminator(line, contentStart);
  if (term.kind === 'gt') {
    const rawOpen = !isClose && RAW_WIDGETS.has(name) ? name : undefined;
    return { next: term.at + 1, ...(rawOpen !== undefined ? { rawOpen } : {}) };
  }
  const stop = term.kind === 'lt' ? term.at : line.length;
  if (!isTagRemainder(line.slice(contentStart, term.at))) {
    return { next: stop };
  }
  return {
    next: stop,
    malformed: openKind(name, lineNo, isClose, term.inQuote),
  };
}

const WS_RE = /\s/;

function isTagRemainder(remainder: string): boolean {
  let i = 0;
  while (i < remainder.length) {
    while (i < remainder.length && WS_RE.test(remainder.charAt(i))) {
      i++;
    }
    if (i >= remainder.length) {
      break;
    }
    if (remainder.charAt(i) === '/') {
      i++;
      continue;
    }
    const next = consumeAttribute(remainder, i);
    if (next === undefined) {
      return false;
    }
    i = next;
  }
  return true;
}

function consumeAttribute(
  remainder: string,
  start: number
): number | undefined {
  const nameMatch = TAG_NAME_RE.exec(remainder.slice(start));
  if (!nameMatch) {
    return undefined;
  }
  let i = start + nameMatch[0].length;
  while (i < remainder.length && WS_RE.test(remainder.charAt(i))) {
    i++;
  }
  if (remainder.charAt(i) !== '=') {
    return undefined;
  }
  i++;
  while (i < remainder.length && WS_RE.test(remainder.charAt(i))) {
    i++;
  }
  const quote = remainder.charAt(i);
  if (quote !== '"' && quote !== "'") {
    return i >= remainder.length ? i : undefined;
  }
  const close = remainder.indexOf(quote, i + 1);
  return close === -1 ? remainder.length : close + 1;
}

interface Terminator {
  kind: 'gt' | 'lt' | 'eol';
  at: number;
  inQuote: boolean;
}

function scanToTerminator(line: string, from: number): Terminator {
  let quote = '';
  for (let j = from; j < line.length; j++) {
    const c = line.charAt(j);
    if (quote) {
      if (c === quote) {
        quote = '';
      }
    } else if (c === '"' || c === "'") {
      quote = c;
    } else if (c === '>') {
      return { kind: 'gt', at: j, inQuote: false };
    } else if (c === '<') {
      return { kind: 'lt', at: j, inQuote: false };
    }
  }
  return { kind: 'eol', at: line.length, inQuote: quote !== '' };
}

function openKind(
  name: string,
  line: number,
  isClose: boolean,
  inQuote: boolean
): MdxMalformed {
  if (inQuote) {
    return { name, line, kind: 'unterminated-quote' };
  }
  return {
    name,
    line,
    kind: isClose ? 'unterminated-close' : 'unterminated-open',
  };
}
