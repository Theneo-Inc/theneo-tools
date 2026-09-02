import { isJsonObject } from '../json';
import { MdxAnalysis, MdxTag, ProjectModel } from '../model';
import { indexPath } from './indexPath';

export interface MdxSection {
  file: string;
  analysis: MdxAnalysis;
}

export function mdxSections(model: ProjectModel): MdxSection[] {
  const result: MdxSection[] = [];
  for (const section of model.declaredSections) {
    if (section.indexMdx) {
      result.push({ file: indexPath(section), analysis: section.indexMdx });
    }
  }
  return result;
}

export function attributesObject(
  tag: MdxTag
): Record<string, unknown> | undefined {
  const raw = tag.props['attributes'];
  if (raw === undefined) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    return isJsonObject(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}
