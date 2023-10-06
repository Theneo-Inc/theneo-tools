import fs from 'fs';
import { DescriptionGenerationType } from 'theneo';

export interface PostmanImportOptions {
  /**
   * Postman API key
   */
  apiKey: string;

  /**
   * Postman collection id
   */
  collection: string;
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
  url?: URL;

  /**
   * API documentation as a string to create the project from.
   */
  text?: string;

  /**
   * Postman collection to create the project from.
   */
  postman?: PostmanImportOptions;

  /**
   * Indicates if the project should be created with sample data.
   */
  sampleData?: boolean;
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
   *  specify if you want to generate descriptions using AI
   *  @default no generation
   */
  descriptionGenerationType?: DescriptionGenerationType;
}
