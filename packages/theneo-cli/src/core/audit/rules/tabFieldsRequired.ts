import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';
import { tabLabel } from './tabLabel';

export const tabFieldsRequiredRule: Rule = {
  id: 'tab-fields-required',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const tab of model.tabs) {
      if (tab.title === undefined) {
        findings.push({
          severity: 'error',
          file: 'theneo.json',
          message: `Tab ${tabLabel(tab)} is missing a non-empty "title".`,
        });
      }
      if (tab.slug === undefined) {
        findings.push({
          severity: 'error',
          file: 'theneo.json',
          message: `Tab ${tabLabel(tab)} is missing a non-empty "slug".`,
        });
      }
    }
    return findings;
  },
};
