import { parseMdx } from '../../src/core/audit/mdx';

describe('parseMdx', () => {
  it('records widget tags with 1-based line numbers', () => {
    const { tags } = parseMdx(
      "<Divider />\n<Callout attributes='{}'>\n</Callout>"
    );

    expect(tags.map(t => [t.name, t.line])).toEqual([
      ['Divider', 1],
      ['Callout', 2],
    ]);
  });

  it('marks self-closing tags and does not expect a closer', () => {
    const { tags, unbalanced } = parseMdx('<Image url="x" />');

    expect(tags[0]?.selfClosing).toBe(true);
    expect(unbalanced).toEqual([]);
  });

  it('parses props including an attributes JSON string that contains ">"', () => {
    const { tags } = parseMdx(
      '<MermaidDiagram attributes=\'{"code":"a --> b"}\'/>'
    );

    expect(tags).toHaveLength(1);
    expect(tags[0]?.props['attributes']).toBe('{"code":"a --> b"}');
  });

  it('computes widget nesting depth, ignoring lowercase HTML tags', () => {
    const { tags } = parseMdx(
      '<CardGroup>\n<Card>\n<p>text</p>\n</Card>\n</CardGroup>'
    );

    const byName = Object.fromEntries(tags.map(t => [t.name, t.depth]));
    expect(byName).toEqual({ CardGroup: 0, Card: 1 });
  });

  it('flags an unclosed tag', () => {
    const { unbalanced } = parseMdx('<Callout>\n<p>x</p>');

    expect(unbalanced).toEqual([
      { name: 'Callout', line: 1, kind: 'unclosed' },
    ]);
  });

  it('flags a closing tag with no opener', () => {
    const { unbalanced } = parseMdx('</Callout>');

    expect(unbalanced).toEqual([
      { name: 'Callout', line: 1, kind: 'unexpected-close' },
    ]);
  });

  it('ignores widget-looking tags inside fenced code blocks', () => {
    const { tags } = parseMdx('```\n<Callout>\n</Callout>\n```');

    expect(tags).toEqual([]);
  });

  it('does not parse widget syntax shown as example text inside a CodeBlock', () => {
    const { tags, unbalanced } = parseMdx(
      "<CodeBlock attributes='{}'>\n  <CodeLine>Use <Callout> like this</CodeLine>\n</CodeBlock>"
    );

    expect(tags.map(t => t.name)).toEqual(['CodeBlock']);
    expect(unbalanced).toEqual([]);
  });

  it('does not treat prose like "<Bearer Token>" as a widget', () => {
    const { tags, unbalanced } = parseMdx(
      '<span>Authorization: <Bearer Token></span>'
    );

    expect(tags).toEqual([]);
    expect(unbalanced).toEqual([]);
  });

  it('links a child tag to its parent widget by index', () => {
    const { tags } = parseMdx('<Tabs>\n<TabPanel>\n</TabPanel>\n</Tabs>');

    const tabPanel = tags.find(t => t.name === 'TabPanel');
    expect(tabPanel?.parentIndex).toBe(0);
    expect(tags[0]?.name).toBe('Tabs');
  });
});

describe('parseMdx malformed detection', () => {
  it('flags an opening tag missing ">" before the next "<"', () => {
    const { malformed } = parseMdx('<table-cell<p>hi</p></table-cell>');

    expect(malformed).toEqual([
      { name: 'table-cell', line: 1, kind: 'unterminated-open' },
    ]);
  });

  it('flags a closing tag missing ">"', () => {
    const { malformed } = parseMdx('</Callout');

    expect(malformed).toEqual([
      { name: 'Callout', line: 1, kind: 'unterminated-close' },
    ]);
  });

  it('flags an unterminated attribute quote', () => {
    const { malformed } = parseMdx("<Callout attributes='{");

    expect(malformed).toEqual([
      { name: 'Callout', line: 1, kind: 'unterminated-quote' },
    ]);
  });

  it('does not flag generics or comparisons in prose', () => {
    const { malformed } = parseMdx(
      'Use Map<String,List<Int>> and a<b<c and x < y'
    );

    expect(malformed).toEqual([]);
  });

  it('does not scan inside a code block', () => {
    const { malformed } = parseMdx(
      "<CodeBlock attributes='{}'>\n<CodeLine>Map<String> a<b</CodeLine>\n</CodeBlock>"
    );

    expect(malformed).toEqual([]);
  });

  it('does not flag a well-formed structural tag', () => {
    const { malformed } = parseMdx('<table-cell><p>hi</p></table-cell>');

    expect(malformed).toEqual([]);
  });

  it('does not flag recognized tag names written as prose', () => {
    const prose = [
      'The <title element sets the page title.',
      'The <title and <description tags are required.',
      'Use the <Table below for reference.',
      "Check the <title's length here.",
    ];

    for (const line of prose) {
      expect(parseMdx(line).malformed).toEqual([]);
    }
  });

  it('still flags a real broken tag with valid attributes at end of line', () => {
    const { malformed } = parseMdx("<Callout attributes='{}'");

    expect(malformed).toEqual([
      { name: 'Callout', line: 1, kind: 'unterminated-open' },
    ]);
  });
});
