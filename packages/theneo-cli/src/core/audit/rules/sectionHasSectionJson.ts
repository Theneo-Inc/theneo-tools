import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const sectionHasSectionJsonRule: Rule = {
  id: 'section-has-section-json',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    if (model.theneoJson.status !== 'ok') {
      return [];
    }

    const findings: RuleFinding[] = [];
    for (const section of model.declaredSections) {
      if (
        section.dir?.exact &&
        !section.hasChildren &&
        !section.hasSectionJson
      ) {
        findings.push({
          severity: 'error',
          file: `${section.slug}/section.json`,
          message: `Section "${section.slug}" is missing section.json.`,
        });
      }
    }
    return findings;
  },
};
