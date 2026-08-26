import { RuleFinding } from '../finding';
import { isJsonObject } from '../json';
import { ProjectModel } from '../model';
import { Rule } from '../rule';

export const sectionDeclarationValidRule: Rule = {
  id: 'section-declaration-valid',
  needsDisk: false,
  run(model: ProjectModel): RuleFinding[] {
    if (model.theneoJson.status !== 'ok') {
      return [];
    }
    const sections = model.theneoJson.value['sections'];
    if (!Array.isArray(sections)) {
      return [];
    }
    const findings: RuleFinding[] = [];
    checkNodes(sections, findings);
    return findings;
  },
};

function checkNodes(nodes: unknown[], findings: RuleFinding[]): void {
  for (const node of nodes) {
    if (!isJsonObject(node)) {
      findings.push({
        severity: 'error',
        file: 'theneo.json',
        message: 'A section entry in theneo.json is not a JSON object.',
      });
      continue;
    }
    const slug = node['slug'];
    if (typeof slug !== 'string' || slug.trim() === '') {
      const name = node['name'];
      const label = typeof name === 'string' ? ` ("${name}")` : '';
      findings.push({
        severity: 'error',
        file: 'theneo.json',
        message: `A section in theneo.json${label} is missing a valid "slug".`,
      });
    }
    const children = node['children'];
    if (Array.isArray(children)) {
      checkNodes(children, findings);
    }
  }
}
