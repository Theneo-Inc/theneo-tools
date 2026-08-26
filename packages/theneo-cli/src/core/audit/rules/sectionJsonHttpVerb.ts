import { RuleFinding } from '../finding';
import { isJsonObject } from '../json';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

const VALID_VERBS = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
  'TRACE',
  'CONNECT',
];
const VALID_VERB_SET = new Set(VALID_VERBS);

export const sectionJsonHttpVerbRule: Rule = {
  id: 'section-json-http-verb',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const folder of model.diskSections) {
      if (folder.sectionJson.status !== 'ok') {
        continue;
      }
      const method = extractMethod(folder.sectionJson.value);
      if (
        method !== undefined &&
        method.trim() !== '' &&
        !VALID_VERB_SET.has(method.toUpperCase())
      ) {
        findings.push({
          severity: 'error',
          file: `${folder.relPath}/section.json`,
          message: `section.json in "${folder.relPath}" has an invalid HTTP method "${method}". Use one of: ${VALID_VERBS.join(', ')}.`,
        });
      }
    }
    return findings;
  },
};

function extractMethod(value: Record<string, unknown>): string | undefined {
  const endpoints = value['endpoints'];
  if (isJsonObject(endpoints) && typeof endpoints['method'] === 'string') {
    return endpoints['method'];
  }
  return undefined;
}
