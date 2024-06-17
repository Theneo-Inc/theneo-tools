import { DescriptionGenerationType, ImportOption } from '@theneo/sdk';
import { Option } from 'commander';
import { checkbox, password, input, select } from '@inquirer/prompts';
import { createSpinner } from 'nanospinner';
import { Theneo } from '@theneo/sdk';

export interface CreateCommandOptions {
  name: string | undefined;
  workspace: string | undefined;
  file: string | undefined;
  link: string | undefined;
  postmanApiKey: string | undefined;
  postmanCollection: string[] | undefined;
  sample: boolean;
  empty: boolean;
  publish: boolean;
  public: boolean;
  generateDescription: DescriptionGenerationType;
  profile: string | undefined;
}

export interface ImportCommandOptions {
  key: string | undefined;
  project: string | undefined;
  versionSlug: string | undefined;
  workspace: string | undefined;
  file: string | undefined;
  link: string | undefined;
  postmanApiKey: string | undefined;
  postmanCollection: string[] | undefined;
  importType: ImportOption | undefined;
  publish: boolean;
  profile: string | undefined;
  keepOldParameterDescription: boolean | undefined;
  keepOldSectionDescription: boolean | undefined;
}

export interface ChosenInputType {
  file?: string;
  link?: string;
  postmanApiKey?: string;
  postmanCollection?: string[];
  empty?: boolean;
}

export interface PostmanData {
  apiKey: string;
  collectionIds: string[];
}

export function createImportTypeOption(): Option {
  return new Option(
    '--import-type <import-type>',
    'Indicates how should the new api spec be imported'
  )
    .choices(Object.values(ImportOption))
    .argParser((value, previous) => {
      if (value !== undefined) {
        return value;
      }
      if (previous !== undefined && previous !== null) {
        return previous;
      }
      return undefined;
    });
}

export function getDescriptionGenerationOption(): Option {
  return new Option(
    '--generate-description <generate-description>',
    'Indicates if AI should be used for description generation'
  )
    .default(DescriptionGenerationType.NO_GENERATION)
    .choices([
      DescriptionGenerationType.FILl,
      DescriptionGenerationType.OVERWRITE,
      DescriptionGenerationType.NO_GENERATION,
    ])
    .argParser((value, previous) => {
      if (value !== undefined) {
        return value;
      }
      if (previous !== undefined && previous !== null) {
        return previous;
      }
      return DescriptionGenerationType.NO_GENERATION;
    });
}

export async function inputPostmanInfo(): Promise<PostmanData> {
  const postmanApiKey = await password({
    message: 'Postman Api Key: ',
    validate: value => {
      if (value.length === 0) return 'Postman Key is required!';
      return true;
    },
  });

  const spinner = createSpinner('Getting Postman collections').start();

  const postmanCollectionsResult =
    await Theneo.listPostmanCollections(postmanApiKey);
  if (postmanCollectionsResult.err) {
    spinner.error({ text: postmanCollectionsResult.error.message });
    process.exit(1);
  }
  spinner.reset();
  spinner.clear();
  const choices = postmanCollectionsResult
    .unwrap()
    .map((collection, index) => ({
      value: collection.id,
      name: `${index + 1}. ${collection.name} - ${collection.id}`,
    }));
  const postmanCollectionIds = await checkbox<string>({
    message: 'Select Postman Collections to import',
    choices: choices,
  });

  return {
    apiKey: postmanApiKey,
    collectionIds: postmanCollectionIds,
  };
}

export function getImportLink(): Promise<string> {
  return input({
    message: 'API file URL (eg: https://example.com/openapi.yml): ',
    validate: value => {
      if (value.length === 0) return 'Link is required!';
      return true;
    },
  });
}

export function getInputFileLocation(): Promise<string> {
  return input({
    message: 'API file name (eg: openapi.yml): ',
    validate: value => {
      if (value.length === 0) return 'File is required!';
      return true;
    },
  });
}

export function getInputDirectoryLocation(): Promise<string> {
  return input({
    message: 'Provide directory location of theneo markdown files: ',
    validate: value => {
      if (value.length === 0) return 'Directory is required!';
      return true;
    },
  });
}

export enum ImportOptionsEnum {
  FILE = 'File',
  LINK = 'Link',
  POSTMAN = 'Postman Collection',
  EMPTY = 'Empty',
}

export async function getImportSource(
  importOptionsList: ImportOptionsEnum[]
): Promise<ChosenInputType> {
  const importType = await select({
    message: 'Select import option',
    choices: importOptionsList.map(type => ({
      value: type,
    })),
  });
  let postmanData: PostmanData;
  switch (importType) {
    case ImportOptionsEnum.FILE:
      return { file: await getInputFileLocation() };
    case ImportOptionsEnum.LINK:
      return { link: await getImportLink() };
    case ImportOptionsEnum.POSTMAN:
      postmanData = await inputPostmanInfo();
      return {
        postmanApiKey: postmanData.apiKey,
        postmanCollection: postmanData.collectionIds,
      };
    case ImportOptionsEnum.EMPTY:
      return { empty: true };
    default:
      throw new Error('Invalid import type');
  }
}

export const IMPORT_OPTIONS_AND_DESCRIPTIONS: {
  option: ImportOption;
  description: string;
}[] = [
  {
    option: ImportOption.OVERWRITE,
    description: 'Overwrite the current API spec in theneo',
  },
  {
    option: ImportOption.APPEND,
    description: 'Append the new API spec to the current API spec',
  },
  {
    option: ImportOption.ENDPOINTS_ONLY,
    description:
      "Import only the endpoints from the new API spec, doesn't update the API spec",
  },
  {
    option: ImportOption.MERGE,
    description:
      'Merge the current API spec with the new API spec - experimental',
  },
];

export function getImportOption(
  options: { importType: ImportOption | undefined },
  isInteractive: boolean
): Promise<ImportOption> | ImportOption {
  if (options.importType !== undefined) {
    return options.importType;
  }
  if (isInteractive) {
    return select({
      message: 'Select import type',
      default: ImportOption.OVERWRITE,
      choices: IMPORT_OPTIONS_AND_DESCRIPTIONS.map(option => ({
        value: option.option,
        description: option.description,
      })),
    });
  }
  return ImportOption.OVERWRITE;
}

export function createFileOption(): Option {
  return new Option(
    '-f, --file <file>',
    'API file path to import (eg: docs/openapi.yml)'
  );
}

export function createLinkOption(): Option {
  return new Option('--link <link>', 'API file URL to create project using it');
}

export function getPostmanApiKeyOption(): Option {
  return new Option(
    '--postman-api-key <postman-api-key>',
    'Postman API Key'
  ).env('THENEO_POSTMAN_API_KEY');
}

export function getPostmanCollectionsOption(): Option {
  return new Option(
    '--postman-collection <postman-collection>',
    'Postman collection id, you can use multiple times'
  ).argParser<string[]>((value, previous) => {
    if (previous === undefined) {
      return [value];
    }
    return [...previous, value];
  });
}
