import {
  callImportProjectApi,
  callImportProjectFromDirectoryApi,
} from 'theneo/requests';
import * as fs from 'fs';
import { Err, ImportProjectOptions, ImportResponse, Result } from 'theneo';
import {
  ImportProjectFromDirectoryInput,
  ImportProjectInput,
} from 'theneo/models';
import { ApiHeaders } from '../../requests/base';
import {
  FILE_SEPARATOR,
  getAllFilesFromDirectory,
  getFilePath,
} from 'theneo/utils/file';

export function importProjectFromDirectory(
  baseUrl: string,
  headers: ApiHeaders,
  options: ImportProjectOptions
): Promise<Result<ImportResponse>> | Result<never> {
  if (!options.data?.directory) {
    return Err(`Directory not provided ${options.data?.directory}`);
  }
  if (!fs.existsSync(options.data.directory)) {
    return Err(`${options.data.directory} - Directory does not exist`);
  }
  const filesInfo = getAllFilesFromDirectory(options.data.directory);
  if (filesInfo.length === 0) {
    return Err(`${options.data.directory} - Directory is empty`);
  }
  const createInput: ImportProjectFromDirectoryInput = {
    filePathSeparator: FILE_SEPARATOR,
    files: filesInfo,
    publish: options.publish ?? false,
    importOption: options.importOption,
    importMetadata: options.importMetadata,
  };

  return callImportProjectFromDirectoryApi(
    baseUrl,
    headers,
    options.projectId,
    createInput,
    options.versionId
  );
}

export function importProject(
  baseUrl: string,
  headers: ApiHeaders,
  options: ImportProjectOptions
): Promise<Result<ImportResponse>> {
  const importInput: ImportProjectInput = {
    publish: options.publish ?? false,
  };
  if (options.data.file) {
    const filePath = getFilePath(options.data.file);
    if (filePath.err) {
      return Promise.resolve(Err(filePath.error));
    }
    importInput.file = fs.readFileSync(filePath.unwrap());
  }
  if (options.data.link) {
    importInput.link = options.data.link.toString();
  }
  if (options.data.text) {
    importInput.text = options.data.text;
  }
  if (options.data.postman) {
    importInput.postmanKey = options.data.postman.apiKey;
    importInput.postmanCollections = options.data.postman.collectionIds;
  }

  importInput.importOption = options.importOption;
  importInput.importMetadata = options.importMetadata;

  return callImportProjectApi(
    baseUrl,
    headers,
    options.projectId,
    importInput,
    options.versionId
  );
}
