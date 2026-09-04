import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';
import { mdxSections } from './mdxHelpers';

const MAX_DEPTH = 1;

export const mdxNestingDepthRule: Rule = {
  id: 'mdx-nesting-depth',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const { file, analysis } of mdxSections(model)) {
      if (analysis.unbalanced.length > 0) {
        continue;
      }
      for (const tag of analysis.tags) {
        if (tag.depth > MAX_DEPTH) {
          findings.push({
            severity: 'warning',
            file,
            line: tag.line,
            message: `<${tag.name}> is nested ${tag.depth} widgets deep; nesting deeper than one level is discouraged.`,
          });
        }
      }
    }
    return findings;
  },
};
