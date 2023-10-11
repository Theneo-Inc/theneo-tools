import { DescriptionGenerationType, ImportOption } from '@theneo/sdk';
import { Option } from 'commander';

export interface CreateCommandOptions {
  name: string | undefined;
  workspace: string | undefined;
  file: string | undefined;
  link: string | undefined;
  sample: boolean;
  publish: boolean;
  public: boolean;
  generateDescription: DescriptionGenerationType;
  profile: string | undefined;
}

export interface ImportCommandOptions {
  key: string | undefined;
  file: string | undefined;
  link: string | undefined;
  importType: ImportOption | undefined;
  publish: boolean;
  profile: string | undefined;
  postmanApiKey: string | undefined;
  postmanCollections: string[] | undefined;
}

export function createImportTypeOption() {
  return new Option(
    '--import-type <import-type>',
    'Indicates how should the new api spec be imported'
  )
    .choices([
      ImportOption.OVERWRITE,
      ImportOption.MERGE,
      ImportOption.ENDPOINTS_ONLY,
    ])
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

export function getDescriptionGenerationOption() {
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
