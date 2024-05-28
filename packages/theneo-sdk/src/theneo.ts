import {
  CreatedProjectStatusEnum,
  CreateProjectOptions,
  CreateProjectResponse,
  CreateProjectVersionOptions,
  DescriptionGenerationProgressHandler,
  DescriptionGenerationType,
  ImportProjectOptions,
  ImportResponse,
  PostmanCollection,
  ProjectCreationStatusResponse,
  ProjectSchema,
  PublishProjectResponse,
  UserRole,
  Workspace,
} from './schema';
import { Err, Ok, Result } from './results';
import {
  callDeleteProjectApi,
  callDescriptionGenerationStatusApi,
  callGetProjectListApi,
  callUserWorkspacesApi,
  exportProjectData,
} from './requests';
import { SDK_VERSION } from './utils/version';

import { createProject } from './core/project/create';
import { sleep } from './utils';
import { callPublishProjectApi } from './requests/publish';
import {
  importProject,
  importProjectFromDirectory,
} from './core/project/import';
import { getPostmanCollections } from 'theneo/requests/postman';
import {
  ApiHeaders,
  THENEO_API_CLIENT_KEY_HEADER_NAME,
  THENEO_API_CLIENT_NAME_HEADER_NAME,
  THENEO_API_CLIENT_VERSION_HEADER_NAME,
} from 'theneo/requests/base';
import { ExportProjectInput } from 'theneo/models';
import { ExportedProject } from 'theneo/schema/export';
import { createFiles } from 'theneo/utils/file';
import { ProjectVersion } from 'theneo/schema/version';
import {
  callGetProjectVersionsApi,
  createProjectVersion,
  deleteProjectVersion,
} from 'theneo/requests/version';

export interface ApiClientMetadata {
  /**
   * Name of the client making the API call.
   * This will be sent to the server as part of the request headers.
   * If not provided, the SDK will use the default value of `theneo-sdk`
   */
  apiClientName: string;

  /**
   * Version of the client making the API call.
   */
  apiClientVersion: string;
}

export interface TheneoOptions {
  /**
   * API key for the Theneo application
   */
  apiKey?: string;

  /**
   * API client metadata, that indicates source and version,
   *
   * e.g theneo-cli, github-action, vscode-extension
   */

  apiClientMetadata?: ApiClientMetadata;

  /**
   * @internal Theneo API URL
   */
  baseApiUrl?: string;

  /**
   * @internal Theneo APP URL
   */
  baseAppUrl?: string;
}

export class Theneo {
  private readonly baseApiUrl: string;
  private readonly baseAppUrl: string;
  private readonly apiKey: string;
  private readonly apiClientMetadata: ApiClientMetadata;

  constructor(options: TheneoOptions) {
    this.baseApiUrl =
      options.baseApiUrl ??
      process.env.THENEO_API_URL ??
      'https://api.theneo.io';

    this.baseAppUrl =
      options.baseAppUrl ??
      process.env.THENEO_APP_URL ??
      'https://app.theneo.io';

    if (!options.apiKey) {
      const apiKey = process.env.THENEO_API_KEY;
      if (!apiKey) {
        throw new Error('No API key provided');
      }
      this.apiKey = apiKey;
    } else {
      this.apiKey = options.apiKey;
    }

    this.apiClientMetadata = options.apiClientMetadata ?? {
      apiClientName: 'theneo-typescript-sdk',
      apiClientVersion: SDK_VERSION,
    };
  }

  /**
   * Returns list of Workspaces available for user
   * @param role user role
   */
  public listWorkspaces(role?: UserRole): Promise<Result<Workspace[]>> {
    return callUserWorkspacesApi(this.baseApiUrl, this.getHeaders(), role);
  }

  /**
   * Returns list of user projects
   */
  public listProjects(): Promise<Result<ProjectSchema[]>> {
    return callGetProjectListApi(this.baseApiUrl, this.getHeaders());
  }

  public listProjectVersions(
    projectId: string
  ): Promise<Result<ProjectVersion[]>> {
    return callGetProjectVersionsApi(
      this.baseApiUrl,
      this.getHeaders(),
      projectId
    );
  }
  /**
   * deletes project
   * @param projectId
   */
  public deleteProjectById(projectId: string): Promise<Result<void>> {
    return callDeleteProjectApi(this.baseApiUrl, this.getHeaders(), projectId);
  }

  /**
   * Publish API documentation
   * If `public` flag is set in project setting then the documentation will be publicly available after publishing it
   * @param projectId
   */
  public publishProject(
    projectId: string
  ): Promise<Result<PublishProjectResponse>> {
    return callPublishProjectApi(this.baseApiUrl, this.getHeaders(), projectId);
  }

  public getPreviewProjectLink(projectId: string): string {
    return `${this.baseAppUrl}/preview/${projectId}?github=${this.apiKey}`;
  }

  /**
   * Imports API document to existing project
   * @param options
   */
  public importProjectDocument(
    options: ImportProjectOptions
  ): Promise<Result<ImportResponse>> | Result<never> {
    if (options.data.directory) {
      return importProjectFromDirectory(
        this.baseApiUrl,
        this.getHeaders(),
        options
      );
    }
    return importProject(this.baseApiUrl, this.getHeaders(), options);
  }

  public async exportProject(
    input: ExportProjectInput
  ): Promise<Result<ExportedProject>> {
    const result = await exportProjectData(
      this.baseApiUrl,
      this.getHeaders(),
      input.projectId
    );
    if (result.err) {
      return result;
    }
    if (!input.noGeneration) {
      const dir = input.dir || './docs';
      createFiles(dir, result.unwrap().sectionContents);
    }

    return result;
  }

  /**
   * Creates a new project on a theneo platform,
   * If the project should be published automatically after creation and description should be generated by AI,
   * Then it waits for description generation and makes a separate call to publish api
   * @param options
   */
  public async createProject(
    options: CreateProjectOptions
  ): Promise<Result<CreateProjectResponse>> {
    const headers = this.getHeaders();

    const result = await createProject(this.baseApiUrl, headers, options);
    if (
      result.ok &&
      (options.descriptionGenerationType === DescriptionGenerationType.FILl ||
        options.descriptionGenerationType ===
          DescriptionGenerationType.OVERWRITE)
    ) {
      const generationResult = await this.waitForDescriptionGeneration(
        result.value.projectId,
        options.progressUpdateHandler
      );

      // TODO make way to chane async the results
      if (generationResult.err) {
        return Err(generationResult.error);
      }

      // need to publish the project if it was created with description generation,
      // otherwise it will be published automatically
      if (options.publish) {
        const publishResult = await this.publishProject(result.value.projectId);
        if (publishResult.ok) {
          const createProjectData: CreateProjectResponse = {
            ...result.value,
            publishData: publishResult.value,
          };
          return Ok(createProjectData);
        }
      }
    }

    return result;
  }

  private getHeaders(): ApiHeaders {
    return {
      ...this.defaultHeaders(),
      ...this.authHeaders(),
    };
  }

  public getDescriptionGenerationStatus(
    projectId: string
  ): Promise<Result<ProjectCreationStatusResponse, Error>> {
    return callDescriptionGenerationStatusApi(
      this.baseApiUrl,
      this.getHeaders(),
      projectId
    );
  }

  private defaultHeaders(): ApiHeaders {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      [THENEO_API_CLIENT_NAME_HEADER_NAME]:
        this.apiClientMetadata.apiClientName,
      [THENEO_API_CLIENT_VERSION_HEADER_NAME]:
        this.apiClientMetadata.apiClientVersion,
    };
  }

  private authHeaders(): ApiHeaders {
    return { [THENEO_API_CLIENT_KEY_HEADER_NAME]: this.apiKey };
  }

  public createProjectVersion(
    options: CreateProjectVersionOptions
  ): Promise<Result<ProjectVersion>> {
    return createProjectVersion(this.baseApiUrl, this.getHeaders(), options);
  }

  public deleteProjectVersion(versionId: string): Promise<Result<void>> {
    return deleteProjectVersion(this.baseApiUrl, this.getHeaders(), versionId);
  }

  /**
   * Waits for the description generation to finish
   * @param projectId Project id
   * @param progressUpdateHandler Callback function that received description generation progress in percentages
   * @param retryTime Default 5 seconds
   * @param maxWaitTime default 10 min
   */
  public async waitForDescriptionGeneration(
    projectId: string,
    progressUpdateHandler?: DescriptionGenerationProgressHandler,
    retryTime = 5_000,
    maxWaitTime = 600_000
  ): Promise<Result<never>> {
    const startTime = Date.now();
    while (true) {
      const generateDescriptionsResult =
        await this.getDescriptionGenerationStatus(projectId);
      if (generateDescriptionsResult.err) {
        console.error(generateDescriptionsResult.error.message);
        process.exit(1);
      }
      if (
        generateDescriptionsResult.value.creationStatus ===
        CreatedProjectStatusEnum.FINISHED
      ) {
        return Ok(null as never);
      }
      if (
        generateDescriptionsResult.value.creationStatus ===
        CreatedProjectStatusEnum.ERROR
      ) {
        return Err(new Error('Error while generating descriptions'));
      }

      if (progressUpdateHandler) {
        progressUpdateHandler(
          generateDescriptionsResult.value.descriptionGenerationProgress
        );
      }
      if (maxWaitTime < startTime - Date.now()) {
        return Err(
          new Error(
            'Timeout while waiting for description generation to finish'
          )
        );
      }

      await sleep(retryTime);
    }
  }

  /**
   * Returns list of Postman Collections using the api key
   * @param postmanApiKey
   */
  public static listPostmanCollections(
    postmanApiKey: string
  ): Promise<Result<PostmanCollection[]>> {
    return getPostmanCollections(postmanApiKey);
  }
}
