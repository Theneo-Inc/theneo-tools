import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const theneoJsonExistsRule: Rule = {
  id: 'theneo-json-exists',
  needsDisk: true,
  run(model: ProjectModel) {
    if (model.theneoJson !== null) {
      return [];
    }
    return [
      {
        severity: 'error',
        file: 'theneo.json',
        message:
          'theneo.json is missing or not valid JSON at the project root. Add a valid theneo.json describing the project.',
      },
    ];
  },
};
