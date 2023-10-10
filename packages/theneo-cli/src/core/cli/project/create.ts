import { confirm, input, select } from '@inquirer/prompts';
import {
  checkDocumentationFile,
  getAbsoluteFilePath,
} from '../../../utils/file';
import { DescriptionGenerationType } from '@theneo/sdk';
import { CreateCommandOptions } from './index';
import { Option } from 'commander';

export async function getDocumentationFileLocation(
  options: CreateCommandOptions
) {
  const specFileName =
    options.file ??
    (await input({
      message: 'API file path to import (eg: docs/openapi.yml) :',
      validate: value => {
        if (value.length === 0) return 'File is required!';
        return true;
      },
    }));

  const absoluteFilePath = getAbsoluteFilePath(specFileName);
  const isValidRes = await checkDocumentationFile(absoluteFilePath);
  if (isValidRes.err) {
    console.error(isValidRes.error);
    process.exit(1);
  }
  return absoluteFilePath;
}

export async function getShouldBePublic(
  options: CreateCommandOptions,
  isInteractive: boolean
): Promise<boolean> {
  if (isInteractive) {
    return confirm({
      message: 'Documentation should be public?',
      default: false,
    });
  }
  return options.publish;
}

export async function getDescriptionGenerationType(
  options: CreateCommandOptions,
  isInteractive: boolean
): Promise<DescriptionGenerationType> {
  if (isInteractive) {
    return select<DescriptionGenerationType>({
      message: 'Select description generation option type with AI',
      choices: [
        {
          name: "Don't generate descriptions",
          value: DescriptionGenerationType.NO_GENERATION,
        },
        {
          name: 'Fill empty descriptions',
          value: DescriptionGenerationType.FILl,
        },
        {
          name: 'Overwrite descriptions',
          value: DescriptionGenerationType.OVERWRITE,
        },
      ],
    });
  }
  return options.generateDescription;
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

export async function getShouldPublish(
  options: { publish: boolean },
  isInteractive: boolean
): Promise<boolean> {
  if (isInteractive) {
    return confirm({
      message: 'Want to publish the project?',
      default: true,
    });
  }
  return options.publish;
}
