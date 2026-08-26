import { DeclaredSection } from '../model';

export function isDeclared(
  declared: readonly DeclaredSection[],
  relPath: string
): boolean {
  const lower = relPath.toLowerCase();
  return declared.some(section => section.slug.toLowerCase() === lower);
}
