import { RuleFinding } from '../finding';
import { IndexMarker, ProjectModel } from '../model';
import { Rule } from '../rule';
import { indexPath } from './indexPath';

export const indexTabMarkerRule: Rule = {
  id: 'index-tab-marker',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    if (model.tabs.length === 0) {
      return [];
    }

    const tabSlugs = new Set(
      model.tabs
        .map(tab => tab.slug)
        .filter((slug): slug is string => slug !== undefined)
    );

    const findings: RuleFinding[] = [];
    for (const section of model.declaredSections) {
      if (section.hasIndexMd && section.indexMarker) {
        const finding = checkMarker(
          indexPath(section),
          section.indexMarker,
          tabSlugs
        );
        if (finding) {
          findings.push(finding);
        }
      }
    }
    return findings;
  },
};

function checkMarker(
  file: string,
  marker: IndexMarker,
  tabSlugs: ReadonlySet<string>
): RuleFinding | undefined {
  if (!marker.present) {
    return {
      severity: 'error',
      file,
      message:
        'index.md is missing a "<!-- tab:slug -->" marker; add one at the top referencing a declared tab.',
    };
  }

  const line = marker.line ? { line: marker.line } : {};

  if (marker.slug === undefined || !tabSlugs.has(marker.slug)) {
    return {
      severity: 'error',
      file,
      ...line,
      message: `index.md marker "<!-- tab:${marker.slug} -->" does not match any declared tab slug.`,
    };
  }

  if (!marker.atTop) {
    return {
      severity: 'warning',
      file,
      ...line,
      message:
        'index.md tab marker should be the first line, before any heading or content.',
    };
  }

  return undefined;
}
