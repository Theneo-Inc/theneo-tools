import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const duplicateTabSlugRule: Rule = {
  id: 'duplicate-tab-slug',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    const seen = new Set<string>();
    const reported = new Set<string>();
    const findings: RuleFinding[] = [];
    for (const tab of model.tabs) {
      if (tab.slug === undefined) {
        continue;
      }
      if (seen.has(tab.slug) && !reported.has(tab.slug)) {
        findings.push({
          severity: 'error',
          file: 'theneo.json',
          message: `Tab slug "${tab.slug}" is used by more than one tab; tab slugs must be unique.`,
        });
        reported.add(tab.slug);
      }
      seen.add(tab.slug);
    }
    return findings;
  },
};
