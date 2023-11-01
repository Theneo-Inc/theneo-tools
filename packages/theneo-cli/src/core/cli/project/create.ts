import { confirm, input, select } from '@inquirer/prompts';
import {
  checkDocumentationFile,
  getAbsoluteFilePath,
} from '../../../utils/file';
import { DescriptionGenerationType } from '@theneo/sdk';
import { CreateCommandOptions } from './index';

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

export function getShouldBePublic(
  options: CreateCommandOptions,
  isInteractive: boolean
): Promise<boolean> {
  if (isInteractive) {
    return confirm({
      message: 'Documentation should be public?',
      default: false,
    });
  }
  return Promise.resolve(options.publish);
}

export function getDescriptionGenerationType(
  options: CreateCommandOptions,
  isInteractive: boolean
): Promise<DescriptionGenerationType> {
  if (options.empty) {
    return Promise.resolve(DescriptionGenerationType.NO_GENERATION);
  }
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
  return Promise.resolve(options.generateDescription);
}
