import {
  CompleteProjectCreationRequest,
  CreateProjectSchema,
  DescriptionGenerationType,
  ProjectSchema,
  PublishProjectResponse,
  PublishProjectSchema,
  UserRole,
  Workspace,
} from './schema';
import { Result } from './results';
import {
  ApiHeaders,
  callCompleteProjectCreation,
  callCreateProject,
  callDeleteProject,
  callDescriptionGenerationStatus,
  callImportProjectDocumentFile,
  callPublishProject,
  callProjectList,
  callUserWorkspaces,
  THENEO_API_CLIENT_KEY_HEADER_NAME,
  THENEO_API_CLIENT_NAME_HEADER_NAME,
} from './requests';
import { SDK_VERSION } from './utils/version';
import { CreateProjectOptions } from 'theneo/models/inputs/project';
import { createProject } from './core/project/create';

export interface TheneoOptions {
  baseApiUrl?: string;
  baseAppUrl?: string;
  apiKey?: string;
  apiClientName?: string;
  timeout?: number;
  maxRetries?: number;
}

export class Theneo {
  private readonly baseApiUrl: string;
  private readonly apiKey: string;
  private readonly apiClientName: string;

  constructor(options: TheneoOptions) {
    this.baseApiUrl =
      options.baseApiUrl ??
      process.env.THENEO_API_URL ??
      'https://api.theneo.com';

    if (!options.apiKey) {
      const apiKey = process.env.THENEO_API_KEY;
      if (!apiKey) {
        throw new Error('No API key provided');
      }
      this.apiKey = apiKey;
    } else {
      this.apiKey = options.apiKey;
    }

    this.apiClientName = options.apiClientName ?? `theneo-sdk:${SDK_VERSION}`;
  }

  public async listWorkspaces(role?: UserRole): Promise<Result<Workspace[]>> {
    return callUserWorkspaces(
      this.baseApiUrl,
      {
        ...this.defaultHeaders(),
        ...this.authHeaders(),
      },
      role
    );
  }

  public async listProjects(): Promise<Result<ProjectSchema[]>> {
    return callProjectList(this.baseApiUrl, {
      ...this.defaultHeaders(),
      ...this.authHeaders(),
    });
  }

  public async deleteProjectById(projectId: string): Promise<Result<void>> {
    return callDeleteProject(
      this.baseApiUrl,
      {
        ...this.defaultHeaders(),
        ...this.authHeaders(),
      },
      projectId
    );
  }

  public async publishProjectById(
    projectId: string
  ): Promise<Result<PublishProjectResponse>> {
    return callPublishProject(
      this.baseApiUrl,
      {
        ...this.defaultHeaders(),
        ...this.authHeaders(),
      },
      projectId
    );
  }

  public async importProjectDocument(
    projectId: string,
    content: Buffer
  ): Promise<Result<string>> {
    return callImportProjectDocumentFile(
      this.baseApiUrl,
      {
        ...this.defaultHeaders(),
        ...this.authHeaders(),
      },
      content,
      projectId
    );
  }

  public async createProjectBase(
    projectName: string,
    workspaceId?: string
  ): Promise<Result<string>> {
    const requestData = this.getCreateProjectRequestData(
      projectName,
      workspaceId
    );
    return callCreateProject(
      this.baseApiUrl,
      {
        ...this.defaultHeaders(),
        ...this.authHeaders(),
      },
      requestData
    );
  }
  public async createProject(
    options: CreateProjectOptions
  ): Promise<Result<string>> {
    const headers = {
      ...this.defaultHeaders(),
      ...this.authHeaders(),
    };
    return createProject(this.baseApiUrl, headers, options);
  }
  public async completeProjectCreation(
    projectId: string,
    isPublic: boolean,
    descriptionGeneration: DescriptionGenerationType
  ): Promise<Result<void, Error>> {
    const requestData: CompleteProjectCreationRequest = {
      isProjectPublic: isPublic,
      shouldOverride:
        descriptionGeneration === DescriptionGenerationType.OVERWRITE
          ? true
          : descriptionGeneration === DescriptionGenerationType.FILl
          ? false
          : undefined,
    };
    return callCompleteProjectCreation(
      this.baseApiUrl,
      {
        ...this.defaultHeaders(),
        ...this.authHeaders(),
      },
      projectId,
      requestData
    );
  }

  public async getDescriptionGenerationStatus(
    projectId: string
  ): Promise<Result<PublishProjectSchema, Error>> {
    return callDescriptionGenerationStatus(
      this.baseApiUrl,
      {
        ...this.defaultHeaders(),
        ...this.authHeaders(),
      },
      projectId
    );
  }

  private getCreateProjectRequestData(
    projectName: string,
    workspaceId: string | undefined
  ) {
    const requestData: CreateProjectSchema = {
      name: projectName,
      workspaceId: workspaceId,
      useSampleFile: false,
      otherDocType: {
        docType: '',
        gettingStartedSections: {
          introduction: false,
          prerequisites: false,
          quickStart: false,
          resources: false,
        },
        sdk: {
          overview: false,
          supportedLibraries: false,
          sampleCode: false,
          troubleshooting: false,
        },
        faq: {
          generalInfo: false,
          authentication: false,
          usage: false,
          billing: false,
        },
      },
    };
    return requestData;
  }

  private getUserAgent(): string {
    return this.apiClientName;
  }

  private defaultHeaders(): ApiHeaders {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      [THENEO_API_CLIENT_NAME_HEADER_NAME]: this.getUserAgent(),
    };
  }

  private authHeaders(): ApiHeaders {
    return { [THENEO_API_CLIENT_KEY_HEADER_NAME]: this.apiKey };
  }
}
