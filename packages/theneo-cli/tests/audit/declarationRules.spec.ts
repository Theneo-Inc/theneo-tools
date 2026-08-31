import { DeclaredSection, ProjectModel } from '../../src/core/audit/model';
import { duplicateSectionSlugRule } from '../../src/core/audit/rules/duplicateSectionSlug';
import { sectionDeclarationValidRule } from '../../src/core/audit/rules/sectionDeclarationValid';

function model(
  sections: unknown[],
  declared: DeclaredSection[] = []
): ProjectModel {
  return {
    root: '/tmp/p',
    dirExists: true,
    theneoJson: { status: 'ok', value: { name: 'd', sections } },
    rootHasIndexMd: false,
    declaredSections: declared,
    diskSections: [],
    tabs: [],
  };
}

function leaf(slug: string): DeclaredSection {
  return {
    slug,
    hasChildren: false,
    topLevel: true,
    hasIndexMd: true,
    hasSectionJson: true,
  };
}

describe('section-declaration-valid rule', () => {
  it('flags a section entry that is missing a slug', () => {
    const findings = sectionDeclarationValidRule.run(
      model([{ name: 'No Slug' }, { slug: 'ok' }])
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
  });

  it('flags a section entry that is not an object', () => {
    expect(sectionDeclarationValidRule.run(model(['nope']))).toHaveLength(1);
  });

  it('recurses into children', () => {
    const findings = sectionDeclarationValidRule.run(
      model([{ slug: 'a', children: [{ name: 'child no slug' }] }])
    );

    expect(findings).toHaveLength(1);
  });

  it('passes when every section has a slug', () => {
    const findings = sectionDeclarationValidRule.run(
      model([{ slug: 'a' }, { slug: 'b', children: [{ slug: 'b/c' }] }])
    );

    expect(findings).toEqual([]);
  });
});

describe('duplicate-section-slug rule', () => {
  it('flags a duplicated slug exactly once', () => {
    const findings = duplicateSectionSlugRule.run(
      model([], [leaf('dup'), leaf('dup'), leaf('dup')])
    );

    expect(findings).toHaveLength(1);
    expect(findings[0]?.severity).toBe('error');
  });

  it('passes when all slugs are unique', () => {
    const findings = duplicateSectionSlugRule.run(
      model([], [leaf('a'), leaf('b')])
    );

    expect(findings).toEqual([]);
  });
});
