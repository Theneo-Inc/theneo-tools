import {
  callImportProjectApi,
  callImportProjectFromDirectoryApi,
} from 'theneo/requests';
import * as fs from 'fs';
import {
  Err,
  ImportOption,
  ImportProjectOptions,
  ImportResponse,
  MergingStrategy,
  Result,
  // eslint-disable-next-line node/no-extraneous-import
} from 'theneo';
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
import type { ImportOptionAdditionalData } from '../../schema/project';

function usesMergeWithAdditionalData(
  option: ImportProjectOptions['importOption']
): boolean {
  return option === ImportOption.MERGE || option === ImportOption.MERGE_V2;
}

function withDefaultMergeStrategies(
  data?: ImportOptionAdditionalData
): ImportOptionAdditionalData {
  return {
    ...data,
    parameterDescriptionMergeStrategy:
      data?.parameterDescriptionMergeStrategy ?? MergingStrategy.KEEP_NEW,
    sectionDescriptionMergeStrategy:
      data?.sectionDescriptionMergeStrategy ?? MergingStrategy.KEEP_NEW,
  };
}

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
  if (options.branchId && options.publish) {
    return Err(
      'Publishing is not supported when importing into a branch; publish the branch instead'
    );
  }
  const createInput: ImportProjectFromDirectoryInput = {
    filePathSeparator: FILE_SEPARATOR,
    files: filesInfo,
    publish: options.publish ?? false,
    importOption: options.importOption,
    importMetadata: options.importMetadata,
    tabSlug: options.tabSlug,
    branchId: options.branchId,
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
  if (options.branchId) {
    return Promise.resolve(
      Err('Branch imports are only supported for markdown directories')
    );
  }
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
  importInput.tabSlug = options.tabSlug;
  importInput.descriptionGenerationType = options.descriptionGenerationType;

  if (usesMergeWithAdditionalData(options.importOption)) {
    importInput.importOptionAdditionalData = withDefaultMergeStrategies(
      options.importOptionAdditionalData
    );
  }

  return callImportProjectApi(
    baseUrl,
    headers,
    options.projectId,
    importInput,
    options.versionId
  );
}
