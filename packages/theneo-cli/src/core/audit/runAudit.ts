import { runRules } from './engine';
import { dedupeFindings, Finding, sortFindings } from './finding';
import { loadProject } from './loader';
import { allRules } from './rules';

export function runAudit(dir: string): Finding[] {
  return sortFindings(dedupeFindings(runRules(loadProject(dir), allRules)));
}
