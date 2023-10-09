import { Command, Option } from 'commander';
import { getProfile } from '../../context/auth';
import { input, select } from '@inquirer/prompts';
import { createSpinner } from 'nanospinner';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';
import { getShouldPublish } from '../../core/cli/project/create';
import { ImportOption } from '@theneo/sdk';

enum ImportTypeOptions {
  FILE = 'file',
  LINK = 'link',
}

// updates `options` object
async function getImportSource(options: {
  file: string | undefined;
  link: string | undefined;
  key: string | undefined;
  publish: boolean;
  profile: string | undefined;
}) {
  const importType = await select({
    message: 'Select import type',
    choices: [
      { value: ImportTypeOptions.FILE, name: 'File' },
      { value: ImportTypeOptions.LINK, name: 'Link' },
    ],
  });

  if (importType === ImportTypeOptions.LINK) {
    options.link = await input({
      message: 'API file URL (eg: https://example.com/openapi.yml) : ',
      validate: value => {
        if (value.length === 0) return 'Link is required!';
        return true;
      },
    });
  } else {
    options.file = await input({
      message: 'API file name (eg: openapi.yml) : ',
      validate: value => {
        if (value.length === 0) return 'File is required!';
        return true;
      },
    });
  }
}

function createImportTypeOption() {
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
    .action(
      async (options: {
        key: string | undefined;
        file: string | undefined;
        link: string | undefined;
        importType: ImportOption | undefined;
        publish: boolean;
        profile: string | undefined;
      }) => {
        const isInteractive = options.key === undefined;
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, options);

        if (!options.file && !options.link) {
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
      }
    );
}
