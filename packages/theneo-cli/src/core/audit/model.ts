export interface SectionEntry {
  slug: string;
  dirRelativePath: string;
}

export interface ProjectModel {
  root: string;
  theneoJson: unknown;
  sections: SectionEntry[];
}
