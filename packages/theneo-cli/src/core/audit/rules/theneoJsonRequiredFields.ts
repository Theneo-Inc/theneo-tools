import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const theneoJsonRequiredFieldsRule: Rule = {
  id: 'theneo-json-required-fields',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    if (model.theneoJson.status !== 'ok') {
      return [];
    }

    const config = model.theneoJson.value;
    const findings: RuleFinding[] = [];

    const name = config['name'];
    if (typeof name !== 'string' || name.trim() === '') {
      findings.push({
        severity: 'error',
        file: 'theneo.json',
        message: 'theneo.json is missing a non-empty "name" field.',
      });
    }

    if (!Array.isArray(config['sections'])) {
      findings.push({
        severity: 'error',
        file: 'theneo.json',
        message: 'theneo.json is missing a "sections" array.',
      });
    }

    return findings;
  },
};
