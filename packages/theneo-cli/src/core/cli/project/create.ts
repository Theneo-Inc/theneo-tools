import { confirm, input, select } from '@inquirer/prompts';
import {
  checkDocumentationFile,
  getAbsoluteFilePath,
} from '../../../utils/file';
import {
  CreatedProjectStatusEnum,
  DescriptionGenerationType,
  Theneo,
} from '@theneo/sdk';
import { Spinner } from 'nanospinner';
import { sleep } from '../../../utils';
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
    '--generate-description',
    'Indicates if AI should be used for description generation'
  )
    .default('no')
    .choices(['fill-empty', 'overwrite-all', 'no'])
    .argParser((value, previous) => {
      if (value === 'fill-empty') {
        return DescriptionGenerationType.FILl;
      }
      if (value === 'overwrite-all') {
        return DescriptionGenerationType.OVERWRITE;
      }
      if (value === 'no') {
        return DescriptionGenerationType.NO_GENERATION;
      }
      return previous;
    });
}

export async function waitForDescriptionGeneration(
  theneo: Theneo,
  spinner: Spinner,
  projectId: string
): Promise<boolean> {
  spinner.reset();
  spinner.start({ text: 'Generating descriptions' });
  while (true) {
    const generateDescriptionsResult =
      await theneo.getDescriptionGenerationStatus(projectId);
    if (generateDescriptionsResult.err) {
      console.error(generateDescriptionsResult.error.message);
      process.exit(1);
    }
    if (
      generateDescriptionsResult.value.creationStatus ===
      CreatedProjectStatusEnum.Finished
    ) {
      spinner.success({ text: 'Description  generation finished' });
      return true;
    }
    if (
      generateDescriptionsResult.value.creationStatus ===
      CreatedProjectStatusEnum.Error
    ) {
      spinner.error({ text: 'Description Generation Errored' });
      return false;
    }
    const progress = generateDescriptionsResult.value
      .descriptionGenerationProgress
      ? `| ${String(
          generateDescriptionsResult.value.descriptionGenerationProgress
        ).substring(0, 2)}%`
      : '';
    spinner.update({
      text: 'Generating descriptions ' + progress,
    });
    await sleep(5000);
  }
}

export async function getShouldPublish(
  options: CreateCommandOptions,
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
