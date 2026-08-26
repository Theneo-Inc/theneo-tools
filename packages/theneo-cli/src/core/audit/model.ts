export type TheneoJsonState =
  | { status: 'ok'; value: Record<string, unknown> }
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'not-object' };

export interface SectionDir {
  relPath: string;
  exact: boolean;
}

export interface DeclaredSection {
  slug: string;
  name?: string;
  hasChildren: boolean;
  dir?: SectionDir;
  hasIndexMd: boolean;
  hasSectionJson: boolean;
}

export interface DiskSection {
  relPath: string;
  hasIndexMd: boolean;
  hasSectionJson: boolean;
  sectionJson: TheneoJsonState;
}

export interface ProjectModel {
  root: string;
  dirExists: boolean;
  theneoJson: TheneoJsonState;
  rootHasIndexMd: boolean;
  declaredSections: DeclaredSection[];
  diskSections: DiskSection[];
}
