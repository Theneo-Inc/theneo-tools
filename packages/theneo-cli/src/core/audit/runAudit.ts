import { runRules } from './engine';
import { Finding } from './finding';
import { loadProject } from './loader';
import { allRules } from './rules';

export function runAudit(dir: string): Finding[] {
  return runRules(loadProject(dir), allRules);
}
