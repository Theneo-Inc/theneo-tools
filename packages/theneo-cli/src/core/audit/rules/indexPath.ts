import { DeclaredSection } from '../model';

export function indexPath(section: DeclaredSection): string {
  const base = section.dir?.relPath ?? section.slug;
  return `${base}/index.md`;
}
