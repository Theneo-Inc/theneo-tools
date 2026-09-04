import { RuleFinding } from '../finding';
import { MdxMalformed, ProjectModel } from '../model';
import { Rule } from '../rule';
import { mdxSections } from './mdxHelpers';

export const mdxMalformedTagRule: Rule = {
  id: 'mdx-malformed-tag',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const { file, analysis } of mdxSections(model)) {
      for (const issue of analysis.malformed) {
        findings.push({
          severity: 'error',
          file,
          line: issue.line,
          message: malformedMessage(issue),
        });
      }
    }
    return findings;
  },
};

function malformedMessage(issue: MdxMalformed): string {
  switch (issue.kind) {
    case 'unterminated-close':
      return `</${issue.name}> is missing its closing ">".`;
    case 'unterminated-quote':
      return `<${issue.name}> has an attribute with an unterminated quote.`;
    default:
      return `<${issue.name}> is missing its closing ">".`;
  }
}
