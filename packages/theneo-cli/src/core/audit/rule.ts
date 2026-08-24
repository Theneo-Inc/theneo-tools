import { RuleFinding } from './finding';
import { ProjectModel } from './model';

export interface Rule {
  id: string;
  needsDisk: boolean;
  run(model: ProjectModel): RuleFinding[];
}
