export interface CompanySchema {
  id: string;
  name: string;
  slug: string;
  corporateId: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProjectSchema {
  id: string;
  name: string;
  key: string;
  isPublic: boolean;
  companyId: string;
  createdAt: Date;
  company: CompanySchema;
}

export interface CreateOtherTypeOfDocOptions {
  docType: string;
  gettingStartedSections?: {
    introduction: boolean;
    prerequisites: boolean;
    quickStart: boolean;
    resources: boolean;
  };
  sdk?: {
    overview: boolean;
    supportedLibraries: boolean;
    sampleCode: boolean;
    troubleshooting: boolean;
  };
  faq?: {
    generalInfo: boolean;
    authentication: boolean;
    usage: boolean;
    billing: boolean;
  };
}

export interface CreateProjectSchema {
  name: string;
  workspaceId?: string | undefined;
  useSampleFile: boolean;
  otherDocType?: CreateOtherTypeOfDocOptions;
}

export interface PublishProjectResponse {
  projectKey: string;
  baseUrlRequired: boolean;
  companySlug: string;
}

export enum CreatedProjectStatusEnum {
  Created = 'CREATED',
  Started = 'STARTED',
  Finished = 'FINISHED',
  Error = 'ERROR',
  CREATED_WITHOUT_AI_GENERATION = 'CREATED_WITHOUT_AI_GENERATION',
}

export interface PublishProjectSchema {
  key: string;
  name: string;
  updatedAt: string;
  creationStatus: CreatedProjectStatusEnum;
  descriptionGenerationProgress: number;
}

export interface CompleteProjectCreationRequest {
  shouldOverride?: boolean | undefined;
  isProjectPublic: boolean;
}
