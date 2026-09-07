import { parseMdx } from '../../src/core/audit/mdx';
import { DeclaredSection, ProjectModel } from '../../src/core/audit/model';
import { mdxAttributesJsonRule } from '../../src/core/audit/rules/mdxAttributesJson';
import { mdxCalloutDataTypeRule } from '../../src/core/audit/rules/mdxCalloutDataType';
import { mdxMalformedTagRule } from '../../src/core/audit/rules/mdxMalformedTag';
import { mdxNestingDepthRule } from '../../src/core/audit/rules/mdxNestingDepth';
import { mdxTabPanelParentRule } from '../../src/core/audit/rules/mdxTabPanelParent';
import { mdxTagsBalancedRule } from '../../src/core/audit/rules/mdxTagsBalanced';

function modelWith(content: string): ProjectModel {
  const section: DeclaredSection = {
    slug: 's',
    hasChildren: false,
    topLevel: true,
    dir: { relPath: 's', exact: true },
    hasIndexMd: true,
    hasSectionJson: true,
    indexMdx: parseMdx(content),
  };
  return {
    root: '/tmp/p',
    dirExists: true,
    theneoJson: { status: 'ok', value: {} },
    rootHasIndexMd: false,
    declaredSections: [section],
    diskSections: [],
    tabs: [],
  };
}

describe('mdx-attributes-json rule', () => {
  it('passes on valid JSON attributes', () => {
    expect(
      mdxAttributesJsonRule.run(
        modelWith('<Callout attributes=\'{"a":1}\'>\n</Callout>')
      )
    ).toEqual([]);
  });

  it('errors on broken JSON attributes with a line number', () => {
    const findings = mdxAttributesJsonRule.run(
      modelWith('<Callout attributes=\'{"a":\'>\n</Callout>')
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
    expect(findings[0]?.line).toBe(1);
  });
});

describe('mdx-callout-datatype rule', () => {
  it.each(['info', 'warning', 'error', 'success'])(
    'accepts dataType "%s"',
    dataType => {
      expect(
        mdxCalloutDataTypeRule.run(
          modelWith(
            `<Callout attributes='{"dataType":"${dataType}"}'>\n</Callout>`
          )
        )
      ).toEqual([]);
    }
  );

  it('errors on an unknown dataType', () => {
    const findings = mdxCalloutDataTypeRule.run(
      modelWith('<Callout attributes=\'{"dataType":"nope"}\'>\n</Callout>')
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
  });

  it('ignores a Callout with no dataType', () => {
    expect(
      mdxCalloutDataTypeRule.run(
        modelWith("<Callout attributes='{}'>\n</Callout>")
      )
    ).toEqual([]);
  });
});

describe('mdx-tabpanel-parent rule', () => {
  it('passes when a TabPanel sits in Tabs with a matching tabTitle', () => {
    expect(
      mdxTabPanelParentRule.run(
        modelWith(
          '<Tabs attributes=\'{"tabs":["A","B"]}\'>\n<TabPanel tabTitle="A"></TabPanel>\n</Tabs>'
        )
      )
    ).toEqual([]);
  });

  it('errors when a TabPanel is not inside Tabs', () => {
    const findings = mdxTabPanelParentRule.run(
      modelWith('<TabPanel tabTitle="A"></TabPanel>')
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toMatch(/inside a <Tabs>/);
  });

  it('errors when tabTitle is not a declared tab of the parent Tabs', () => {
    const findings = mdxTabPanelParentRule.run(
      modelWith(
        '<Tabs attributes=\'{"tabs":["A"]}\'>\n<TabPanel tabTitle="Z"></TabPanel>\n</Tabs>'
      )
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toMatch(/"Z"/);
  });
});

describe('mdx-nesting-depth rule', () => {
  it('allows one level of widget nesting', () => {
    expect(
      mdxNestingDepthRule.run(
        modelWith('<CardGroup>\n<Card></Card>\n</CardGroup>')
      )
    ).toEqual([]);
  });

  it('warns when a widget is two levels deep', () => {
    const findings = mdxNestingDepthRule.run(
      modelWith('<Card>\n<CardGroup>\n<Divider />\n</CardGroup>\n</Card>')
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('warning');
    expect(findings[0]?.line).toBe(3);
  });

  it('stands down when the file has unbalanced tags (avoids a cascade)', () => {
    const findings = mdxNestingDepthRule.run(
      modelWith('<Callout>\n<Card></Card>\n<CardGroup></CardGroup>')
    );

    expect(findings).toEqual([]);
  });
});

describe('mdx-tags-balanced rule', () => {
  it('passes on balanced widgets', () => {
    expect(mdxTagsBalancedRule.run(modelWith('<Callout>\n</Callout>'))).toEqual(
      []
    );
  });

  it('errors on an unclosed widget', () => {
    const findings = mdxTagsBalancedRule.run(modelWith('<Callout>'));

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
  });
});

describe('mdx-malformed-tag rule', () => {
  it('errors with a line number on a malformed tag', () => {
    const findings = mdxMalformedTagRule.run(
      modelWith('<Table>\n<table-cell<p>x</p></table-cell>\n</Table>')
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
    expect(findings[0]?.line).toBe(2);
  });

  it('passes on well-formed markup', () => {
    expect(
      mdxMalformedTagRule.run(
        modelWith("<Callout attributes='{}'>\n</Callout>")
      )
    ).toEqual([]);
  });
});
