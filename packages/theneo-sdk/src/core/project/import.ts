import { ApiHeaders, callImportProjectApi } from 'theneo/requests';
import { ImportProjectOptions } from 'theneo/models/inputs/project';
import { Err, ImportProjectInput, ImportResponse, Result } from 'theneo';
import * as fs from 'fs';

export async function importProject(
  baseUrl: string,
  headers: ApiHeaders,
  options: ImportProjectOptions
): Promise<Result<ImportResponse>> {
  const importInput: ImportProjectInput = {
    publish: options.publish ?? false,
  };
  if (options.data.file !== undefined) {
    if (!fs.existsSync(options.data.file)) {
      return Err(new Error('File does not exist'));
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
    importInput.postmanCollections = options.data.postman.collectionId;
  }

  if (options.importOption !== undefined) {
    importInput.importOption = options.importOption;
  }
  return callImportProjectApi(baseUrl, headers, options.projectId, importInput);
}
