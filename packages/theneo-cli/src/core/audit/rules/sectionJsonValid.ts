import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const sectionJsonValidRule: Rule = {
  id: 'section-json-valid',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const folder of model.diskSections) {
      if (!folder.hasSectionJson) {
        continue;
      }
      const file = `${folder.relPath}/section.json`;
      if (folder.sectionJson.status === 'invalid') {
        findings.push({
          severity: 'error',
          file,
          message: `section.json in "${folder.relPath}" is not valid JSON.`,
        });
      } else if (folder.sectionJson.status === 'not-object') {
        findings.push({
          severity: 'error',
          file,
          message: `section.json in "${folder.relPath}" must be a JSON object.`,
        });
      }
    }
    return findings;
  },
};
