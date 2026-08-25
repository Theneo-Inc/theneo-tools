import { RuleFinding } from '../finding';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const projectDirectoryExistsRule: Rule = {
  id: 'project-directory-exists',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    if (model.dirExists) {
      return [];
    }
    return [
      {
        severity: 'error',
        file: '.',
        message: `Project directory "${model.root}" does not exist or is not a directory. Pass an existing project directory with --dir.`,
      },
    ];
  },
};
