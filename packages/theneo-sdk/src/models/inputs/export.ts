export interface ExportProjectInput {
  projectId: string;
  versionId?: string;
  dir?: string;
  noGeneration?: boolean;
  shouldGetPublicViewData?: boolean;
  openapi?: boolean;
  tabSlug?: string;
}
