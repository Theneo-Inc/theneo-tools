import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const sectionInOneTabRule: Rule = {
  id: 'section-in-exactly-one-tab',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    if (model.tabs.length === 0) {
      return [];
    }

    const findings: RuleFinding[] = [];
    const seen = new Set<string>();
    for (const section of model.declaredSections) {
      if (!section.topLevel || seen.has(section.slug)) {
        continue;
      }
      seen.add(section.slug);

      const owners = model.tabs.filter(tab =>
        tab.sections.includes(section.slug)
      ).length;

      if (owners === 0) {
        findings.push({
          severity: 'error',
          file: 'theneo.json',
          message: `Section "${section.slug}" is not listed in any tab; add it to exactly one tab's "sections".`,
        });
      } else if (owners > 1) {
        findings.push({
          severity: 'error',
          file: 'theneo.json',
          message: `Section "${section.slug}" is listed in ${owners} tabs; it must belong to exactly one.`,
        });
      }
    }
    return findings;
  },
};
