import { parseIndexMarker } from '../../src/core/audit/marker';

describe('parseIndexMarker', () => {
  it('detects a marker on the first line as present and at the top', () => {
    const marker = parseIndexMarker('<!-- tab:docs -->\n\n# Heading');

    expect(marker).toEqual({
      present: true,
      slug: 'docs',
      atTop: true,
      line: 1,
    });
  });

  it('ignores leading blank lines when deciding atTop', () => {
    const marker = parseIndexMarker('\n\n<!-- tab:docs -->\n# Heading');

    expect(marker.present).toBe(true);
    expect(marker.atTop).toBe(true);
    expect(marker.line).toBe(3);
  });

  it('flags a marker that appears after a heading as not at the top', () => {
    const marker = parseIndexMarker('# Heading\n\n<!-- tab:docs -->');

    expect(marker.present).toBe(true);
    expect(marker.slug).toBe('docs');
    expect(marker.atTop).toBe(false);
    expect(marker.line).toBe(3);
  });

  it('captures the slug even when it is not a known tab', () => {
    const marker = parseIndexMarker('<!-- tab:typo-99 -->');

    expect(marker.slug).toBe('typo-99');
  });

  it('reports absent when there is no marker', () => {
    expect(parseIndexMarker('# Just a heading\n')).toEqual({
      present: false,
      atTop: false,
    });
  });

  it('tolerates loose whitespace inside the comment', () => {
    expect(parseIndexMarker('<!--   tab:docs   -->').slug).toBe('docs');
  });
});
