export enum BranchKind {
  STANDARD = 'standard',
  PREVIEW = 'preview',
}

export enum BranchStatus {
  ACTIVE = 'active',
  IN_REVIEW = 'in_review',
  MERGING = 'merging',
  MERGED = 'merged',
  ABANDONED = 'abandoned',
}

export interface Branch {
  id: string;
  name: string;
  kind: BranchKind;
  status: BranchStatus;
  projectId: string;
  versionId: string;
  createdBy: string | null;
  isFrozen: boolean;
  activeReviewId: string | null;
  /** ISO date; only set for preview branches */
  expiresAt: string | null;
  lastActivityAt: string | null;
  createdAt: string | null;
  /** Only present on getBranch: base changed since the branch was created or rebased */
  isStale?: boolean;
}

export interface BranchListResponse {
  branches: Branch[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface ListBranchesOptions {
  projectId: string;
  versionId?: string;
  status?: BranchStatus;
  kind?: BranchKind;
  page?: number;
  limit?: number;
}

export interface CreateBranchOptions {
  projectId: string;
  /** Defaults to the project's default version */
  versionId?: string;
  /** Required for standard branches, generated for preview branches */
  name?: string;
  kind?: BranchKind;
  /** Preview branches only: lifetime in hours (default 24, max 168) */
  expiresInHours?: number;
}

export interface BranchPreviewLink {
  branchId: string;
  previewUrl: string;
  expiresAt: string;
}

export interface CreatePreviewDeploymentOptions {
  projectId: string;
  /** Defaults to the project's default version */
  versionId?: string;
  /** Directory holding the exported markdown project */
  directory: string;
  /** Optional custom branch name */
  name?: string;
  /** Lifetime of the preview branch and link in hours (default 24, max 168) */
  expiresInHours?: number;
  /** Import into a single tab of the preview branch */
  tabSlug?: string;
}

export interface PreviewDeployment {
  branch: Branch;
  collectionId: string;
  previewUrl: string;
  expiresAt: string;
}
