import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const noRootIndexMdRule: Rule = {
  id: 'no-root-index-md',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    if (!model.rootHasIndexMd) {
      return [];
    }
    return [
      {
        severity: 'error',
        file: 'index.md',
        message:
          'index.md must not exist at the project root. Move it into a section folder.',
      },
    ];
  },
};
