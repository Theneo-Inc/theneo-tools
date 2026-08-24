export type TheneoJsonState =
  | { status: 'ok'; value: Record<string, unknown> }
  | { status: 'missing' }
  | { status: 'invalid' }
  | { status: 'not-object' };

export interface SectionEntry {
  slug: string;
  dirRelativePath: string;
}

export interface ProjectModel {
  root: string;
  dirExists: boolean;
  theneoJson: TheneoJsonState;
  sections: SectionEntry[];
}
