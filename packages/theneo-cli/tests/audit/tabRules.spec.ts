import {
  DeclaredSection,
  IndexMarker,
  ProjectModel,
  TabModel,
} from '../../src/core/audit/model';
import { duplicateTabSlugRule } from '../../src/core/audit/rules/duplicateTabSlug';
import { indexTabMarkerRule } from '../../src/core/audit/rules/indexTabMarker';
import { sectionInOneTabRule } from '../../src/core/audit/rules/sectionInOneTab';
import { tabFieldsRequiredRule } from '../../src/core/audit/rules/tabFieldsRequired';
import { tabIconXorSvgRule } from '../../src/core/audit/rules/tabIconXorSvg';
import { tabSectionsResolveRule } from '../../src/core/audit/rules/tabSectionsResolve';
import { tabsDeclarationValidRule } from '../../src/core/audit/rules/tabsDeclarationValid';

function tab(overrides: Partial<TabModel> & { index: number }): TabModel {
  return {
    hasIconUrl: true,
    hasSvgCode: false,
    sections: [],
    ...overrides,
  };
}

function section(
  slug: string,
  overrides: Partial<DeclaredSection> = {}
): DeclaredSection {
  return {
    slug,
    hasChildren: false,
    topLevel: true,
    hasIndexMd: false,
    hasSectionJson: true,
    ...overrides,
  };
}

function model(overrides: Partial<ProjectModel> = {}): ProjectModel {
  return {
    root: '/tmp/p',
    dirExists: true,
    theneoJson: { status: 'ok', value: {} },
    rootHasIndexMd: false,
    declaredSections: [],
    diskSections: [],
    tabs: [],
    ...overrides,
  };
}

describe('tab-fields-required rule', () => {
  it('flags a tab with a missing title and a missing slug', () => {
    const findings = tabFieldsRequiredRule.run(
      model({ tabs: [tab({ index: 0 })] })
    );

    expect(findings).toHaveLength(2);
    expect(findings.every(f => f.severity === 'error')).toBe(true);
  });

  it('passes when title and slug are present', () => {
    const findings = tabFieldsRequiredRule.run(
      model({ tabs: [tab({ index: 0, title: 'Docs', slug: 'docs' })] })
    );

    expect(findings).toEqual([]);
  });
});

describe('tabs-declaration-valid rule', () => {
  function withTabsValue(tabs: unknown): ProjectModel {
    return model({
      theneoJson: { status: 'ok', value: { name: 'd', sections: [], tabs } },
    });
  }

  it('errors when tabs is present but not an array', () => {
    const findings = tabsDeclarationValidRule.run(withTabsValue('oops'));

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
  });

  it('passes when tabs is an array', () => {
    expect(tabsDeclarationValidRule.run(withTabsValue([]))).toEqual([]);
  });

  it('passes when tabs is absent', () => {
    const findings = tabsDeclarationValidRule.run(
      model({
        theneoJson: { status: 'ok', value: { name: 'd', sections: [] } },
      })
    );

    expect(findings).toEqual([]);
  });
});

describe('duplicate-tab-slug rule', () => {
  it('errors once when two tabs share a slug', () => {
    const findings = duplicateTabSlugRule.run(
      model({
        tabs: [
          tab({ index: 0, slug: 'docs' }),
          tab({ index: 1, slug: 'docs' }),
          tab({ index: 2, slug: 'docs' }),
        ],
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
  });

  it('ignores tabs with no slug and passes on unique slugs', () => {
    const findings = duplicateTabSlugRule.run(
      model({
        tabs: [
          tab({ index: 0, slug: 'a' }),
          tab({ index: 1 }),
          tab({ index: 2, slug: 'b' }),
        ],
      })
    );

    expect(findings).toEqual([]);
  });
});

describe('tab-icon-xor-svg rule', () => {
  it('warns when a tab has both iconUrl and svgCode', () => {
    const findings = tabIconXorSvgRule.run(
      model({ tabs: [tab({ index: 0, hasIconUrl: true, hasSvgCode: true })] })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('warning');
  });

  it('warns when a tab has neither iconUrl nor svgCode', () => {
    const findings = tabIconXorSvgRule.run(
      model({ tabs: [tab({ index: 0, hasIconUrl: false, hasSvgCode: false })] })
    );

    expect(findings).toHaveLength(1);
  });

  it('passes when exactly one is set', () => {
    expect(
      tabIconXorSvgRule.run(
        model({
          tabs: [tab({ index: 0, hasIconUrl: true, hasSvgCode: false })],
        })
      )
    ).toEqual([]);
  });
});

describe('section-in-exactly-one-tab rule', () => {
  const tabs = [tab({ index: 0, slug: 'docs', sections: ['a'] })];

  it('errors when a top-level section is in zero tabs', () => {
    const findings = sectionInOneTabRule.run(
      model({ tabs, declaredSections: [section('a'), section('b')] })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain('"b"');
    expect(findings[0]?.severity).toBe('error');
  });

  it('ignores non-top-level sections', () => {
    const findings = sectionInOneTabRule.run(
      model({
        tabs,
        declaredSections: [
          section('a'),
          section('a/child', { topLevel: false }),
        ],
      })
    );

    expect(findings).toEqual([]);
  });

  it('does nothing when there are no tabs', () => {
    expect(
      sectionInOneTabRule.run(
        model({ tabs: [], declaredSections: [section('a')] })
      )
    ).toEqual([]);
  });
});

describe('tab-sections-resolve rule', () => {
  it('errors when a tab references an undeclared section', () => {
    const findings = tabSectionsResolveRule.run(
      model({
        tabs: [tab({ index: 0, slug: 'docs', sections: ['a', 'ghost'] })],
        declaredSections: [section('a')],
      })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.message).toContain('"ghost"');
    expect(findings[0]?.severity).toBe('error');
  });
});

describe('index-tab-marker rule', () => {
  const tabs = [tab({ index: 0, slug: 'docs', sections: ['a'] })];

  function withMarker(marker: IndexMarker): ProjectModel {
    return model({
      tabs,
      declaredSections: [
        section('a', { hasIndexMd: true, indexMarker: marker }),
      ],
    });
  }

  it('errors when the marker is missing', () => {
    const findings = indexTabMarkerRule.run(
      withMarker({ present: false, atTop: false })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
    expect(findings[0]?.message).toMatch(/missing/);
  });

  it('errors when the marker slug is not a declared tab', () => {
    const findings = indexTabMarkerRule.run(
      withMarker({ present: true, slug: 'typo', atTop: true, line: 1 })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
  });

  it('warns when the marker is valid but not at the top', () => {
    const findings = indexTabMarkerRule.run(
      withMarker({ present: true, slug: 'docs', atTop: false, line: 4 })
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('warning');
    expect(findings[0]?.line).toBe(4);
  });

  it('passes for a valid marker at the top', () => {
    expect(
      indexTabMarkerRule.run(
        withMarker({ present: true, slug: 'docs', atTop: true, line: 1 })
      )
    ).toEqual([]);
  });

  it('does nothing when there are no tabs', () => {
    const findings = indexTabMarkerRule.run(
      model({
        tabs: [],
        declaredSections: [
          section('a', {
            hasIndexMd: true,
            indexMarker: { present: false, atTop: false },
          }),
        ],
      })
    );

    expect(findings).toEqual([]);
  });
});
