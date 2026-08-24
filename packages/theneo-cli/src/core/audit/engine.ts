import { Finding } from './finding';
import { ProjectModel } from './model';
import { Rule } from './rule';

export function runRules(
  model: ProjectModel,
  rules: readonly Rule[]
): Finding[] {
  return rules.flatMap(rule =>
    rule.run(model).map(finding => ({ ...finding, rule: rule.id }))
  );
}
