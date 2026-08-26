import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const sectionHasIndexMdRule: Rule = {
  id: 'section-has-index-md',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    if (model.theneoJson.status !== 'ok') {
      return [];
    }

    const findings: RuleFinding[] = [];
    for (const section of model.declaredSections) {
      if (section.dir?.exact && !section.hasChildren && !section.hasIndexMd) {
        findings.push({
          severity: 'error',
          file: `${section.slug}/index.md`,
          message: `Section "${section.slug}" is missing index.md.`,
        });
      }
    }
    return findings;
  },
};
