import { DescriptionGenerationType, ImportOption } from '../models';
import { PublishProjectResponse } from 'theneo/schema/publish';

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

export interface ImportProjectInput {
  file?: Buffer;
  link?: string;
  text?: string;
  postmanKey?: string;
  postmanCollections?: string[];
  importOption?: ImportOption;
  publish: boolean;
}

export interface CreateProjectInput {
  name: string;
  isPublic: boolean;
  publish: boolean;
  descriptionGenerationType: DescriptionGenerationType;
  workspaceId?: string | undefined;
  sampleFile?: boolean;
  otherDocumentType?: CreateOtherTypeOfDocOptions;
  file?: Buffer;
  link?: string;
  text?: string;
  postmanKey?: string;
  postmanCollections?: string[];
}

export enum CreatedProjectStatusEnum {
  Created = 'CREATED',
  Started = 'STARTED',
  Finished = 'FINISHED',
  Error = 'ERROR',
  CREATED_WITHOUT_AI_GENERATION = 'CREATED_WITHOUT_AI_GENERATION',
}

export interface CreateProjectResponse {
  projectId: string;
  publishData?: PublishProjectResponse;
}

export interface ProjectCreationStatusResponse {
  /**
   * Project name
   */
  name: string;
  /**
   * Project key - used to identify a project in API URL
   */
  key: string;

  /**
   * Creation status of a description generation for a project
   */
  creationStatus: CreatedProjectStatusEnum;

  /**
   * Progress of description generation in percentage
   */
  descriptionGenerationProgress: number;
  updatedAt: string;
}

export interface ImportResponse {
  collectionId: string;
  publishData?: PublishProjectResponse;
}
