import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const orphanDeclaredMissingRule: Rule = {
  id: 'orphan-declared-missing',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    if (model.theneoJson.status !== 'ok') {
      return [];
    }

    const findings: RuleFinding[] = [];
    for (const section of model.declaredSections) {
      if (section.dir === undefined) {
        findings.push({
          severity: 'error',
          file: section.slug,
          message: `Section "${section.slug}" is declared in theneo.json but has no folder on disk.`,
        });
      }
    }
    return findings;
  },
};
