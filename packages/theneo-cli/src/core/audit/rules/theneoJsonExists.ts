import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

const MESSAGES: Record<'missing' | 'invalid' | 'not-object', string> = {
  missing:
    'theneo.json is missing at the project root. Add a theneo.json describing the project.',
  invalid:
    'theneo.json is not valid JSON. Fix the JSON syntax so the file can be parsed.',
  'not-object':
    'theneo.json must be a JSON object. Replace its contents with an object describing the project.',
};

export const theneoJsonExistsRule: Rule = {
  id: 'theneo-json-exists',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    if (!model.dirExists || model.theneoJson.status === 'ok') {
      return [];
    }
    return [
      {
        severity: 'error',
        file: 'theneo.json',
        message: MESSAGES[model.theneoJson.status],
      },
    ];
  },
};
