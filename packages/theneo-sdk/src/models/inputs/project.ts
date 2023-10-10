import * as fs from 'fs';

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
  collectionId: string[];
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
  file?: fs.PathLike;

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
  MERGE = 'merge',
}

export interface ImportProjectOptions {
  projectId: string;
  publish: boolean;
  data: ApiDataInputOption;
  /**
   * indicates what should happen to old data when new api spec is imported
   */
  importOption?: ImportOption;
}
