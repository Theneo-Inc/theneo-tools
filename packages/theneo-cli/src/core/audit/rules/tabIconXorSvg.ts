import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';
import { tabLabel } from './tabLabel';

export const tabIconXorSvgRule: Rule = {
  id: 'tab-icon-xor-svg',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const tab of model.tabs) {
      if (tab.hasIconUrl === tab.hasSvgCode) {
        const detail = tab.hasIconUrl
          ? 'has both "iconUrl" and "svgCode"'
          : 'has neither "iconUrl" nor "svgCode"';
        findings.push({
          severity: 'warning',
          file: 'theneo.json',
          message: `Tab ${tabLabel(tab)} ${detail}; set exactly one of them.`,
        });
      }
    }
    return findings;
  },
};
