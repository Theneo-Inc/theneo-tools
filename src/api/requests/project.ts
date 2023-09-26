import {
  convertProject,
  CreateProjectSchema,
  ProjectSchema,
  PublishProjectResponse,
  PublishProjectSchema,
} from '../schema/project';
import axios from 'axios';
import { Project } from '../../models/project';
import { getCommonHeaders } from './base/headers';
import { ResponseSchema } from '../schema/base';
import FormData from 'form-data';
import { Result } from '../../results';

const WRONG_STATUS_CODE_ERROR = 'API returned status code: ';
const EMPTY_RESPONSE_ERROR = 'No data returned from API! message:';

export async function queryProjectList(
  baseUrl: string,
  apiKey: string
): Promise<Result<Project[], Error>> {
  const urlPath = new URL(`${baseUrl}/project/api-client`);

  try {
    const result = await axios.get<ResponseSchema<ProjectSchema[]>>(
      urlPath.toString(),
      {
        headers: getCommonHeaders(apiKey),
      }
    );

    if (result.status !== 200) {
      return Result.err(new Error(WRONG_STATUS_CODE_ERROR + result.status));
    }

    const data = result.data.data;
    if (data === undefined) {
      return Result.err(new Error(EMPTY_RESPONSE_ERROR + result.data.message));
    }
    const projects = data.map(project => convertProject(project));
    console.assert(result.data.message === 'Success');
    return Result.ok(projects);
  } catch (error) {
    return Result.err(error as Error);
  }
}

export async function createProject(
  baseUrl: string,
  apiKey: string,
  requestData: CreateProjectSchema
): Promise<Result<string, Error>> {
  const urlPath = new URL(`${baseUrl}/project/create/api-client`);

  try {
    const result = await axios.post<ResponseSchema<string>>(
      urlPath.toString(),
      requestData,
      {
        headers: getCommonHeaders(apiKey),
      }
    );

    if (result.status !== 200) {
      return Result.err(new Error(WRONG_STATUS_CODE_ERROR + result.status));
    }
    const data = result.data.data;
    if (data === undefined) {
      return Result.err(new Error(EMPTY_RESPONSE_ERROR + result.data.message));
    }
    console.assert(result.data.message === 'Success');
    return Result.ok(data);
  } catch (error) {
    return Result.err(error as Error);
  }
}

export async function importProjectDocumentFile(
  baseUrl: string,
  apiKey: string,
  content: Buffer,
  projectId: string | null = null
): Promise<Result<string, Error>> {
  if (!projectId) {
    return Result.err(new Error('projectId and projectSlug are required'));
  }

  const urlPath = new URL(`${baseUrl}/project/${projectId}/import/api-client`);

  const bodyFormData = new FormData();
  bodyFormData.append('file', content);

  try {
    const result = await axios.post<ResponseSchema<string>>(
      urlPath.toString(),
      bodyFormData,
      {
        headers: {
          ...getCommonHeaders(apiKey),
          ...bodyFormData.getHeaders(),
        },
      }
    );

    if (result.status !== 200) {
      return Result.err(new Error(WRONG_STATUS_CODE_ERROR + result.status));
    }
    const data = result.data.data;
    if (data === undefined) {
      return Result.err(new Error(EMPTY_RESPONSE_ERROR + result.data.message));
    }
    console.assert(result.data.message === 'Success');
    return Result.ok(data);
  } catch (error) {
    return Result.err(error as Error);
  }
}

export async function publishProject(
  baseUrl: string,
  apiKey: string,
  projectId: string
): Promise<Result<PublishProjectResponse, Error>> {
  const urlPath = new URL(`${baseUrl}/publish/${projectId}/api-client`);

  try {
    const result = await axios.post<ResponseSchema<PublishProjectResponse>>(
      urlPath.toString(),
      {},
      {
        headers: getCommonHeaders(apiKey),
      }
    );

    if (result.status !== 200) {
      return Result.err(new Error(WRONG_STATUS_CODE_ERROR + result.status));
    }
    const data = result.data.data;
    if (data === undefined) {
      return Result.err(new Error(EMPTY_RESPONSE_ERROR + result.data.message));
    }
    console.assert(result.data.message === 'Success');
    return Result.ok(data);
  } catch (error) {
    return Result.err(error as Error);
  }
}

export async function deleteProject(
  baseUrl: string,
  apiKey: string,
  projectId: string
): Promise<Result<null, Error>> {
  const urlPath = new URL(`${baseUrl}/project/${projectId}/api-client`);

  try {
    const result = await axios.delete<ResponseSchema<null>>(
      urlPath.toString(),
      {
        headers: getCommonHeaders(apiKey),
      }
    );

    if (result.status !== 200) {
      return Result.err(new Error(WRONG_STATUS_CODE_ERROR + result.status));
    }

    console.assert(result.data.message === 'Success');
    return Result.ok(null);
  } catch (error) {
    return Result.err(error as Error);
  }
}

export async function completeProjectCreation(
  baseUrl: string,
  apiKey: string,
  projectId: string,
  requestData: {
    shouldOverride?: boolean;
    isProjectPublic: boolean;
  }
) {
  const urlPath = new URL(
    `${baseUrl}/project/${projectId}/create/complete/api-client`
  );

  try {
    const result = await axios.post<null>(urlPath.toString(), requestData, {
      headers: getCommonHeaders(apiKey),
    });

    if (result.status !== 200) {
      return Result.err(new Error(WRONG_STATUS_CODE_ERROR + result.status));
    }

    return Result.ok(null);
  } catch (error) {
    return Result.err(error as Error);
  }
}

export async function getDescriptionGenerationStatus(
  baseUrl: string,
  apiKey: string,
  projectId: string
): Promise<Result<PublishProjectSchema, Error>> {
  const urlPath = new URL(`${baseUrl}/project/${projectId}/status/api-client`);

  try {
    const result = await axios.get<PublishProjectSchema>(urlPath.toString(), {
      headers: getCommonHeaders(apiKey),
    });

    if (result.status !== 200) {
      return Result.err(new Error(WRONG_STATUS_CODE_ERROR + result.status));
    }

    return Result.ok(result.data);
  } catch (error) {
    return Result.err(error as Error);
  }
}
