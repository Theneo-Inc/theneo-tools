import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { input, select, checkbox, password } from '@inquirer/prompts';
import { createSpinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import { getProject, getShouldPublish } from '../../core/cli/project/project';
import {
  createImportTypeOption,
  ImportCommandOptions,
} from '../../core/cli/project';
import { Theneo } from '@theneo/sdk';

enum ImportTypeOptions {
  FILE = 'file',
  LINK = 'link',
  POSTMAN = 'postman',
}

export function initProjectImportCommand() {
  return new Command('import')
    .description('Update theneo project with a updated API file')
    .option(
      '--key <project-key>',
      'Specify the project key to import updated documentation in'
    )
    .option('-f, --file <file>', 'Specify the file to import')
    .option('--link <link>', 'API file URL to import')
    .addOption(createImportTypeOption())
    .option('--publish', 'Automatically publish the project', false)
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(async (options: ImportCommandOptions) => {
      const isInteractive = options.key === undefined;
      const profile = getProfile(options.profile);
      const theneo = createTheneo(profile);
      const project = await getProject(theneo, options);

      if (
        !options.file &&
        !options.link &&
        (!options.postmanApiKey ||
          !options.postmanCollections ||
          options.postmanCollections.length === 0)
      ) {
        await getImportSource(options);
      }

      const shouldPublish = await getShouldPublish(options, isInteractive);

      const spinner = createSpinner('Updating documentation').start();
      const res = await theneo.importProjectDocument({
        projectId: project.id,
        publish: shouldPublish,
        data: {
          file: options.file,
          link: options.link ? new URL(options.link) : undefined,
          postman:
            options.postmanApiKey && options.postmanCollections
              ? {
                  apiKey: options.postmanApiKey,
                  collectionIds: options.postmanCollections,
                }
              : undefined,
        },
        importOption: options.importType,
      });
      if (res.err) {
        spinner.error({ text: res.error.message });
        process.exit(1);
      }
      if (res.value.publishData?.publishedPageUrl) {
        spinner.success({
          text: `Project published successfully! Published Page: ${res.value.publishData.publishedPageUrl}`,
        });
      } else {
        const editorLink = `${profile.appUrl}/editor/${project.id}`;
        spinner.success({
          text: `Project created, you can make changes via editor before publishing. Editor link: ${editorLink}`,
        });
      }
    });
}

async function inputPostmanInfo(options: ImportCommandOptions) {
  options.postmanApiKey = await password({
    message: 'Postman Api Key: ',
    validate: value => {
      if (value.length === 0) return 'Postman Key is required!';
      return true;
    },
  });

  const spinner = createSpinner('Getting Postman collections').start();

  const postmanCollectionsResult = await Theneo.listPostmanCollections(
    options.postmanApiKey
  );
  if (postmanCollectionsResult.err) {
    spinner.error({ text: postmanCollectionsResult.error.message });
    process.exit(1);
  }
  spinner.clear();
  const choices = postmanCollectionsResult.unwrap().map(collection => ({
    value: collection.id,
    name: `${collection.name} - ${collection.id}`,
  }));
  const postmanCollections1 = await checkbox<string>({
    message: 'Select Postman Collections to import',
    choices: choices,
  });
  options.postmanCollections = postmanCollections1;
}

// updates `options` object
async function getImportSource(options: ImportCommandOptions) {
  const importType = await select({
    message: 'Select import type',
    choices: [
      { value: ImportTypeOptions.FILE, name: 'File' },
      { value: ImportTypeOptions.LINK, name: 'Link' },
      { value: ImportTypeOptions.POSTMAN, name: 'Postman Collection' },
    ],
  });
  switch (importType) {
    case ImportTypeOptions.FILE:
      options.link = await input({
        message: 'API file URL (eg: https://example.com/openapi.yml): ',
        validate: value => {
          if (value.length === 0) return 'Link is required!';
          return true;
        },
      });
      break;
    case ImportTypeOptions.LINK:
      options.file = await input({
        message: 'API file name (eg: openapi.yml): ',
        validate: value => {
          if (value.length === 0) return 'Link is required!';
          return true;
        },
      });
      break;
    case ImportTypeOptions.POSTMAN:
      await inputPostmanInfo(options);
      break;
    default:
      throw new Error('Invalid import type');
  }
}
