import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const sectionSlugMatchesFolderRule: Rule = {
  id: 'section-slug-matches-folder',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    if (model.theneoJson.status !== 'ok') {
      return [];
    }

    const findings: RuleFinding[] = [];
    for (const section of model.declaredSections) {
      if (section.dir && !section.dir.exact) {
        findings.push({
          severity: 'error',
          file: section.dir.relPath,
          message: `Folder "${section.dir.relPath}" does not match its declared slug "${section.slug}" (slugs are case-sensitive).`,
        });
      }
    }
    return findings;
  },
};
