import {
  CompleteProjectCreationRequest,
  CreateProjectSchema,
  DescriptionGenerationType,
  PublishProjectResponse,
  PublishProjectSchema,
  UserRole,
  Workspace,
} from './schema';
import { Result } from './results';
import {
  ApiHeaders,
  completeProjectCreation,
  createProject,
  deleteProject,
  getDescriptionGenerationStatus,
  importProjectDocumentFile,
  publishProject,
  queryProjectList,
  queryUserWorkspaces,
  THENEO_API_CLIENT_KEY_HEADER_NAME,
} from './requests';
import { Project } from './models';
import { SDK_VERSION } from './utils/version';

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
    return queryUserWorkspaces(
      this.baseApiUrl,
      {
        ...this.defaultHeaders(),
        ...this.authHeaders(),
      },
      role
    );
  }

  public async listProjects(): Promise<Result<Project[]>> {
    return queryProjectList(this.baseApiUrl, {
      ...this.defaultHeaders(),
      ...this.authHeaders(),
    });
  }

  public async deleteProjectById(projectId: string): Promise<Result<void>> {
    return deleteProject(
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
    return publishProject(
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
    return importProjectDocumentFile(
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
    workspaceId: string
  ): Promise<Result<string>> {
    const requestData = this.getCreateProjectRequestData(
      projectName,
      workspaceId
    );
    return createProject(
      this.baseApiUrl,
      {
        ...this.defaultHeaders(),
        ...this.authHeaders(),
      },
      requestData
    );
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
    return completeProjectCreation(
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
    return getDescriptionGenerationStatus(
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
    workspaceId: string
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
      'User-Agent': this.getUserAgent(),
    };
  }

  private authHeaders(): ApiHeaders {
    return { [THENEO_API_CLIENT_KEY_HEADER_NAME]: this.apiKey };
  }
}
