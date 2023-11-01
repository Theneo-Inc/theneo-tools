import { callImportProjectApi } from 'theneo/requests';
import * as fs from 'fs';
import { Err, ImportProjectOptions, ImportResponse, Result } from 'theneo';
import { ImportProjectInput } from 'theneo/models';
import { ApiHeaders } from '../../requests/base';

export function importProject(
  baseUrl: string,
  headers: ApiHeaders,
  options: ImportProjectOptions
): Promise<Result<ImportResponse>> {
  const importInput: ImportProjectInput = {
    publish: options.publish ?? false,
  };
  if (options.data.file !== undefined) {
    if (!fs.existsSync(options.data.file)) {
      return Promise.resolve(Err(new Error('File does not exist')));
    }
    importInput.file = fs.readFileSync(options.data.file);
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

  if (options.importOption !== undefined) {
    importInput.importOption = options.importOption;
  }
  return callImportProjectApi(baseUrl, headers, options.projectId, importInput);
}
