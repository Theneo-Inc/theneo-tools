import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';
import { mdxSections } from './mdxHelpers';

export const mdxAttributesJsonRule: Rule = {
  id: 'mdx-attributes-json',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const { file, analysis } of mdxSections(model)) {
      for (const tag of analysis.tags) {
        const raw = tag.props['attributes'];
        if (raw !== undefined && !isValidJson(raw)) {
          findings.push({
            severity: 'error',
            file,
            line: tag.line,
            message: `<${tag.name}> has an "attributes" prop that is not valid JSON.`,
          });
        }
      }
    }
    return findings;
  },
};

function isValidJson(raw: string): boolean {
  try {
    JSON.parse(raw);
    return true;
  } catch {
    return false;
  }
}
