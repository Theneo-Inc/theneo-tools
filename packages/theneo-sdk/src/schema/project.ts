import { Company, Project } from '../models';

export interface CompanySchema {
  _id: string;
  name: string;
  slug: string;
  corporateId: string;
  createdAt: Date;
  updatedAt: Date;
  v: number;
  createdBy: string;
}

export interface ProjectSchema {
  _id: string;
  name: string;
  key: string;
  isPublic: boolean;
  companyId: string;
  createdAt: Date;
  company: CompanySchema;
}

function convertCompany(company: CompanySchema): Company {
  return {
    ...company,
    id: company._id,
  };
}

export function convertProject(project: ProjectSchema): Project {
  return {
    ...project,
    id: project._id,
    company: convertCompany(project.company),
  };
}

export interface CreateProjectSchema {
  name: string;
  workspaceId: string;
  useSampleFile: boolean;
  otherDocType: {
    docType: string;
    gettingStartedSections: {
      introduction: boolean;
      prerequisites: boolean;
      quickStart: boolean;
      resources: boolean;
    };
    sdk: {
      overview: boolean;
      supportedLibraries: boolean;
      sampleCode: boolean;
      troubleshooting: boolean;
    };
    faq: {
      generalInfo: boolean;
      authentication: boolean;
      usage: boolean;
      billing: boolean;
    };
  };
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
