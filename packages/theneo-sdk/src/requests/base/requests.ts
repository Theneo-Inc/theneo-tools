import { Err, Ok, Result } from '../../results';
import axios from 'axios';

export type ApiHeaders = Record<string, string>;
export type ApiQueryParams = Record<string, string | undefined>;
export const THENEO_API_CLIENT_KEY_HEADER_NAME = 'x-theneo-api-key';
export const THENEO_API_CLIENT_NAME_HEADER_NAME = 'x-theneo-api-client';

const UNKNOWN_ERROR_MESSAGE = 'Unknown error';
const EMPTY_DATA_ERROR_MESSAGE = 'No data returned from API';
function addQueryParameters(url: URL, queryParams: ApiQueryParams) {
  Object.keys(queryParams).forEach(key => {
    const queryParam = queryParams[String(key)];
    if (queryParam !== undefined && queryParam !== null && queryParam !== '') {
      url.searchParams.append(key, queryParam);
    }
  });
}
export interface BaseRequestInput {
  url: URL;
  headers: ApiHeaders;
  queryParams?: ApiQueryParams;
}

export interface GetRequestInput extends BaseRequestInput {}

export async function getRequest<Response>({
  url,
  headers,
  queryParams,
}: GetRequestInput): Promise<Result<Response, Error>> {
  if (queryParams) {
    addQueryParameters(url, queryParams);
  }
  try {
    const result = await axios.get<Response>(url.toString(), {
      headers: headers,
    });

    if (result.status >= 400) {
      return Err(
        new Error(
          `API returned status code: ${result.status} ${result.statusText}`
        )
      );
    }
    const data = result.data;
    if (data === undefined) {
      return Err(new Error(EMPTY_DATA_ERROR_MESSAGE));
    }
    return Ok(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return Err(
        error.response ? new Error(String(error.response.data)) : error
      );
    }
    if (error instanceof Error) {
      return Err(error);
    }
    return Err(new Error(UNKNOWN_ERROR_MESSAGE));
  }
}

export interface PostRequestInput<Request> extends BaseRequestInput {
  requestBody?: Request;
}

export async function postRequest<Request, Response>({
  url,
  headers,
  queryParams,
  requestBody,
}: PostRequestInput<Request>): Promise<Result<Response, Error>> {
  if (queryParams) {
    addQueryParameters(url, queryParams);
  }
  try {
    const result = await axios.post<Response>(url.toString(), requestBody, {
      headers: headers,
    });

    if (result.status >= 400) {
      return Err(
        new Error(
          `API returned status code: ${result.status} ${result.statusText}`
        )
      );
    }
    const data = result.data;
    if (data === undefined) {
      return Err(new Error(EMPTY_DATA_ERROR_MESSAGE));
    }
    return Ok(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return Err(
        error.response ? new Error(String(error.response.data)) : error
      );
    }
    if (error instanceof Error) {
      return Err(error);
    }
    return Err(new Error(UNKNOWN_ERROR_MESSAGE));
  }
}

export interface DeleteRequestInput extends BaseRequestInput {}

export async function deleteRequest<Response>({
  url,
  headers,
  queryParams,
}: DeleteRequestInput): Promise<Result<Response, Error>> {
  if (queryParams) {
    addQueryParameters(url, queryParams);
  }
  try {
    const result = await axios.delete<Response>(url.toString(), {
      headers: headers,
    });

    if (result.status >= 400) {
      return Err(
        new Error(
          `API returned status code: ${result.status} ${result.statusText}`
        )
      );
    }
    const data = result.data;
    if (data === undefined) {
      return Err(new Error(EMPTY_DATA_ERROR_MESSAGE));
    }
    return Ok(data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return Err(
        error.response ? new Error(String(error.response.data)) : error
      );
    }
    if (error instanceof Error) {
      return Err(error);
    }
    return Err(new Error(UNKNOWN_ERROR_MESSAGE));
  }
}
