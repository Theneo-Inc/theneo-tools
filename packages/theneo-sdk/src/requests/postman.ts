import axios from 'axios';
import { handleApiThrownError } from './base';
import { Ok, Result } from '../results';
import { PostmanCollection } from 'theneo';

const POSTMAN_API_URL = 'https://api.getpostman.com';
const POSTMAN_API_KEY_HEADER = 'x-api-key';

async function httpGet<Response>(
  urlPath: string,
  apiKey: string
): Promise<Result<Response>> {
  try {
    const result = await axios.get<Response>(POSTMAN_API_URL + urlPath, {
      headers: { [POSTMAN_API_KEY_HEADER]: apiKey },
    });
    return Ok(result.data);
  } catch (error) {
    return handleApiThrownError(error);
  }
}

interface PostmanCollectionsResponse {
  collections: PostmanCollection[];
}

export async function getPostmanCollections(
  apiKey: string
): Promise<Result<PostmanCollection[]>> {
  return (
    await httpGet<PostmanCollectionsResponse>('/collections', apiKey)
  ).map(collections => collections.collections);
}

export async function getPostmanCollectionById(
  apiKey: string,
  id: string
): Promise<Result<PostmanCollection>> {
  return httpGet<PostmanCollection>(`/collections/${id}`, apiKey);
}
