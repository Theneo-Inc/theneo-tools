export interface ProjectVersion {
  id: string;
  name: string;
  slug: string;
  isDefaultVersion: boolean;
  versionTag: string;
  createdAt: string;
  createdBy: string;
  publishedAt?: string;
  isPublished?: boolean;
}
