import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';
import { isDeclared } from './sectionMatch';

export const orphanOnDiskUndeclaredRule: Rule = {
  id: 'orphan-on-disk-undeclared',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    if (model.theneoJson.status !== 'ok') {
      return [];
    }

    const findings: RuleFinding[] = [];
    for (const folder of model.diskSections) {
      if (!isDeclared(model.declaredSections, folder.relPath)) {
        findings.push({
          severity: 'warning',
          file: folder.relPath,
          message: `Folder "${folder.relPath}" looks like a section but is not declared in theneo.json.`,
        });
      }
    }
    return findings;
  },
};
