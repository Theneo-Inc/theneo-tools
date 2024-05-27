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

export enum CreatedProjectStatusEnum {
  CREATED = 'CREATED',
  STARTED = 'STARTED',
  FINISHED = 'FINISHED',
  ERROR = 'ERROR',
  CREATED_WITHOUT_AI_GENERATION = 'CREATED_WITHOUT_AI_GENERATION',
}

export interface CreateProjectResponse {
  projectId: string;
  publishData?: PublishProjectResponse;
  projectData?: any;
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

export enum DescriptionGenerationType {
  FILl = 'fill',
  OVERWRITE = 'overwrite',
  NO_GENERATION = 'no_generation',
}

export type DescriptionGenerationProgressHandler = (
  progressPercent: number
) => void;

export interface PostmanImportOptions {
  /**
   * Postman API key
   */
  apiKey: string;

  /**
   * Postman collection ids to be imported in theneo
   */
  collectionIds: string[];
}

/**
 * Workspace options for creating a project.
 * should be specified either workspace key or workspace id
 */
export interface WorkspaceOption {
  /**
   * Workspace key
   */
  key?: string;

  /**
   * Workspace id
   */
  id?: string;
}

/**
 * Data input options for creating a project.
 * must be specified only one of the following attributes
 */
export interface ApiDataInputOption {
  /**
   * Path to a file containing the API Documentation to create the project from.
   */
  file?: string;

  directory?: string;

  /**
   * URL to a file containing the API Documentation to create the project from.
   */
  link?: URL;

  /**
   * API documentation as a string to create the project from.
   */
  text?: string;

  /**
   * Postman collection to create the project from.
   */
  postman?: PostmanImportOptions;

  exportDirectory?: string;
}

export interface CreateProjectOptions {
  /**
   * Project name
   */
  name: string;

  /**
   * Workspace key where to create the project
   * @default default workspace for user
   */
  workspace?: WorkspaceOption;

  /**
   * indicates if the project should be published after creation
   * @default false
   */
  publish?: boolean;

  /**
   * indicates if the project is public
   * @default false
   */
  isPublic?: boolean;

  /**
   * Indicates API Documentation data using which the project should be created
   * @default empty project.
   * @see ApiDataInputOption for more details.
   */
  data?: ApiDataInputOption;

  /**
   * Indicates if the project should be created with sample data.
   */
  sampleData?: boolean;

  /**
   *  Used to generate descriptions using AI
   *  Specify `fill` if you want to generate description for params that does not have descriptions already.
   *  Specify `overwrite` if you want to overwrite descriptions for params that does not have descriptions already.
   *  Specify `no_generation` if you want to not generate descriptions for params that does not have descriptions already.
   *
   *  @see DescriptionGenerationType for more details.
   *  @see DescriptionGenerationProgressHandler for more details.
   *  @default no generation
   */
  descriptionGenerationType?: DescriptionGenerationType;

  /**
   * call back function that is called when description generation progress is received
   */
  progressUpdateHandler?: DescriptionGenerationProgressHandler;
}

export enum ImportOption {
  ENDPOINTS_ONLY = 'endpoints',
  OVERWRITE = 'overwrite',
  APPEND = 'append',
  MERGE = 'merge',
}

export interface ImportMetadata {
  /**
   * Author name of the current changes that is displayed in theneo editor only.
   *
   * Useful for team collaboration, might serve the same purpose as git commit author
   * when importing updated documentation
   */
  authorName?: string;
}

export interface ImportProjectOptions {
  projectId: string;
  versionId?: string;
  publish: boolean;
  data: ApiDataInputOption;
  /**
   * indicates what should happen to old data when new api spec is imported
   */
  importOption?: ImportOption;

  /**
   * Additional import metadata/information
   */
  importMetadata?: ImportMetadata;
}
