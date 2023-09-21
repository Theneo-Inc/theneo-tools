import { Err, Ok, Result } from 'ts-results';
import {
  convertProject,
  CreateProjectSchema,
  ProjectSchema,
  PublishProjectResponse,
} from './schema/project';
import axios from 'axios';
import { Project } from '../models/project';
import { getCommonHeaders } from './base/headers';
import { ResponseSchema } from './schema/base';
import FormData from 'form-data';

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
      return Err(new Error('API returned status code ' + result.status));
    }

    const data = result.data.data;
    if (data === undefined) {
      return Err(
        new Error('No data returned from API: message' + result.data.message)
      );
    }
    const projects = data.map(project => convertProject(project));
    console.assert(result.data.message === 'Success');
    return Ok(projects);
  } catch (error) {
    return Err(error as Error);
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
      return Err(new Error('API returned status code ' + result.status));
    }
    const projectId = result.data.data;
    if (projectId === undefined) {
      return Err(
        new Error('No data returned from API: message' + result.data.message)
      );
    }
    console.assert(result.data.message === 'Success');
    return Ok(projectId);
  } catch (error) {
    return Err(error as Error);
  }
}

export async function importProjectDocumentFile(
  baseUrl: string,
  apiKey: string,
  content: Buffer,
  projectId: string | null = null
): Promise<Result<string, Error>> {
  if (!projectId) {
    return Err(new Error('projectId and projectSlug are required'));
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
      return Err(new Error('API returned status code ' + result.status));
    }
    const projectId = result.data.data;
    if (projectId === undefined) {
      return Err(
        new Error('No data returned from API: message' + result.data.message)
      );
    }
    console.assert(result.data.message === 'Success');
    return Ok(projectId);
  } catch (error) {
    return Err(error as Error);
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
      return Err(new Error('API returned status code ' + result.status));
    }
    const projectId = result.data.data;
    if (projectId === undefined) {
      return Err(
        new Error('No data returned from API: message' + result.data.message)
      );
    }
    console.assert(result.data.message === 'Success');
    return Ok(projectId);
  } catch (error) {
    return Err(error as Error);
  }
}
