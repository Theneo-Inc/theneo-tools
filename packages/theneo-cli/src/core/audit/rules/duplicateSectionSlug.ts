import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const duplicateSectionSlugRule: Rule = {
  id: 'duplicate-section-slug',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    if (model.theneoJson.status !== 'ok') {
      return [];
    }

    const seen = new Set<string>();
    const reported = new Set<string>();
    const findings: RuleFinding[] = [];
    for (const section of model.declaredSections) {
      if (seen.has(section.slug) && !reported.has(section.slug)) {
        findings.push({
          severity: 'error',
          file: 'theneo.json',
          message: `Section slug "${section.slug}" is declared more than once in theneo.json.`,
        });
        reported.add(section.slug);
      }
      seen.add(section.slug);
    }
    return findings;
  },
};
