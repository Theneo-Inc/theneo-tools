import { RuleFinding } from '../finding';
import { MdxTag, ProjectModel } from '../model';
import { Rule } from '../rule';
import { attributesObject, mdxSections } from './mdxHelpers';

export const mdxTabPanelParentRule: Rule = {
  id: 'mdx-tabpanel-parent',
  needsDisk: true,
  run(model: ProjectModel): RuleFinding[] {
    const findings: RuleFinding[] = [];
    for (const { file, analysis } of mdxSections(model)) {
      for (const tag of analysis.tags) {
        if (tag.name !== 'TabPanel') {
          continue;
        }
        const finding = checkTabPanel(tag, analysis.tags, file);
        if (finding) {
          findings.push(finding);
        }
      }
    }
    return findings;
  },
};

function checkTabPanel(
  tag: MdxTag,
  tags: readonly MdxTag[],
  file: string
): RuleFinding | undefined {
  const parent =
    tag.parentIndex !== undefined ? tags[tag.parentIndex] : undefined;
  if (!parent || parent.name !== 'Tabs') {
    return {
      severity: 'error',
      file,
      line: tag.line,
      message: '<TabPanel> must be nested directly inside a <Tabs>.',
    };
  }

  const tabTitle = tag.props['tabTitle'];
  const declared = declaredTabTitles(parent);
  if (
    tabTitle !== undefined &&
    declared !== undefined &&
    !declared.has(tabTitle)
  ) {
    return {
      severity: 'error',
      file,
      line: tag.line,
      message: `<TabPanel> tabTitle "${tabTitle}" is not one of its <Tabs> declared tabs.`,
    };
  }
  return undefined;
}

function declaredTabTitles(tabs: MdxTag): Set<string> | undefined {
  const declared = attributesObject(tabs)?.['tabs'];
  if (!Array.isArray(declared)) {
    return undefined;
  }
  return new Set(declared.filter((t): t is string => typeof t === 'string'));
}
