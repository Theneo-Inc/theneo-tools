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

export interface CreateProjectVersionOptions {
  name: string;
  projectId: string;
  previousVersionId?: string;
  isNewVersion?: boolean;
  isEmpty?: boolean;
  isDefault?: boolean;
}

export interface AddSubscriberToProjectVersionQuery {
  email: string;
  projectVersionId: string;
}
