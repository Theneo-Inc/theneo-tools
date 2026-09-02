import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';
import { mdxSections } from './mdxHelpers';

export const mdxTagsBalancedRule: Rule = {
  id: 'mdx-tags-balanced',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const { file, analysis } of mdxSections(model)) {
      for (const issue of analysis.unbalanced) {
        findings.push({
          severity: 'error',
          file,
          line: issue.line,
          message:
            issue.kind === 'unclosed'
              ? `<${issue.name}> is never closed; add a matching </${issue.name}>.`
              : `</${issue.name}> has no matching opening tag.`,
        });
      }
    }
    return findings;
  },
};
