import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const tabsDeclarationValidRule: Rule = {
  id: 'tabs-declaration-valid',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    if (model.theneoJson.status !== 'ok') {
      return [];
    }

    const tabs = model.theneoJson.value['tabs'];
    if (tabs !== undefined && !Array.isArray(tabs)) {
      return [
        {
          severity: 'error',
          file: 'theneo.json',
          message: 'theneo.json "tabs" must be an array.',
        },
      ];
    }
    return [];
  },
};
