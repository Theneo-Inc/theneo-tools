import { callImportProjectApi } from 'theneo/requests';
import * as fs from 'fs';
import { Err, ImportProjectOptions, ImportResponse, Result } from 'theneo';
import { ImportProjectInput } from 'theneo/models';
import { ApiHeaders } from '../../requests/base';
import { getFilePath } from 'theneo/utils/file';

export function importProject(
  baseUrl: string,
  headers: ApiHeaders,
  options: ImportProjectOptions
): Promise<Result<ImportResponse>> {
  const importInput: ImportProjectInput = {
    publish: options.publish ?? false,
  };
  if (options.data.file !== undefined) {
    const filePath = getFilePath(options.data.file);
    if (filePath.err) {
      return Promise.resolve(Err(filePath.error));
    }
    importInput.file = fs.readFileSync(filePath.unwrap());
  }
  if (options.data.link !== undefined) {
    importInput.link = options.data.link.toString();
  }
  if (options.data.text !== undefined) {
    importInput.text = options.data.text;
  }
  if (options.data.postman !== undefined) {
    importInput.postmanKey = options.data.postman.apiKey;
    importInput.postmanCollections = options.data.postman.collectionIds;
  }

  importInput.importOption = options.importOption;
  importInput.importMetadata = options.importMetadata;

  return callImportProjectApi(baseUrl, headers, options.projectId, importInput);
}
