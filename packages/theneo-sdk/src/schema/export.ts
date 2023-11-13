export interface SectionFile {
  fileName: string;
  content: string;
}

export interface ExportedProject {
  sectionContents: SectionFile[];
  config: any;
}
