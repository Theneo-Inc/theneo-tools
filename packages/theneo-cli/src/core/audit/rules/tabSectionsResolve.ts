import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';
import { tabLabel } from './tabLabel';

export const tabSectionsResolveRule: Rule = {
  id: 'tab-sections-resolve',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    const declaredSlugs = new Set(model.declaredSections.map(s => s.slug));

    const findings: RuleFinding[] = [];
    for (const tab of model.tabs) {
      for (const slug of tab.sections) {
        if (!declaredSlugs.has(slug)) {
          findings.push({
            severity: 'error',
            file: 'theneo.json',
            message: `Tab ${tabLabel(
              tab
            )} references section "${slug}", which is not a declared section.`,
          });
        }
      }
    }
    return findings;
  },
};
