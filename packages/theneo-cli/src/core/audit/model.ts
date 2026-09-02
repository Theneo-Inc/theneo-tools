export type TheneoJsonState =
  | { status: 'ok'; value: Record<string, unknown> }
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'not-object' };

export interface SectionDir {
  relPath: string;
  exact: boolean;
}

export interface IndexMarker {
  present: boolean;
  slug?: string;
  atTop: boolean;
  line?: number;
}

export interface DeclaredSection {
  slug: string;
  name?: string;
  hasChildren: boolean;
  topLevel: boolean;
  dir?: SectionDir;
  hasIndexMd: boolean;
  hasSectionJson: boolean;
  indexMarker?: IndexMarker;
}

export interface TabModel {
  index: number;
  title?: string;
  slug?: string;
  hasIconUrl: boolean;
  hasSvgCode: boolean;
  sections: string[];
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
  tabs: TabModel[];
}
