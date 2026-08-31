import { TabModel } from '../model';

export function tabLabel(tab: TabModel): string {
  if (tab.slug) {
    return `"${tab.slug}"`;
  }
  if (tab.title) {
    return `"${tab.title}"`;
  }
  return `#${tab.index + 1}`;
}
