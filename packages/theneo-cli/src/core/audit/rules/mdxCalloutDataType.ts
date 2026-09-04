import { RuleFinding } from '../finding';
import { MdxTag, ProjectModel } from '../model';
import { Rule } from '../rule';
import { attributesObject, mdxSections } from './mdxHelpers';

const VALID_DATA_TYPES = new Set(['info', 'warning', 'error', 'success']);

export const mdxCalloutDataTypeRule: Rule = {
  id: 'mdx-callout-datatype',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const { file, analysis } of mdxSections(model)) {
      for (const tag of analysis.tags) {
        const dataType = calloutDataType(tag);
        if (dataType !== undefined && !VALID_DATA_TYPES.has(dataType)) {
          findings.push({
            severity: 'error',
            file,
            line: tag.line,
            message: `<Callout> has an invalid dataType "${dataType}". Use one of: ${[
              ...VALID_DATA_TYPES,
            ].join(', ')}.`,
          });
        }
      }
    }
    return findings;
  },
};

function calloutDataType(tag: MdxTag): string | undefined {
  if (tag.name !== 'Callout') {
    return undefined;
  }
  const dataType = attributesObject(tag)?.['dataType'];
  return typeof dataType === 'string' ? dataType : undefined;
}
