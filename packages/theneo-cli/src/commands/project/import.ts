import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { input } from '@inquirer/prompts';
import { createSpinner } from 'nanospinner';
import { checkDocumentationFile, getAbsoluteFilePath } from '../../utils/file';
import { readFile } from 'fs/promises';
import { createTheneo } from '../../core/theneo';
import { getProject } from '../../core/cli/project/project';

export function initProjectImportCommand() {
  return new Command('import')
    .description('Update theneo project with a updated API file')
    .option('--project <project>', 'Specify the project key to import')
    .option('-f, --file <file>', 'Specify the file to import')
    .option('--publish', 'Automatically publish the project', false)
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      async (options: {
        file: string | undefined;
        project: string | undefined;
        publish: boolean;
        profile: string | undefined;
      }) => {
        const profile = getProfile(options.profile);
        const theneo = createTheneo(profile);
        const project = await getProject(theneo, options);
        const specFileName =
          options.file ??
          (await input({
            message: 'API file name (eg: openapi.yml) : ',
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

        const file = await readFile(absoluteFilePath);
        const spinner = createSpinner(
          "updating project's documentation file"
        ).start();
        const importResult = await theneo.importProjectDocument(
          project.id,
          file
        );
        if (importResult.err) {
          console.error(importResult.error.message);
          process.exit(1);
        }
        spinner.success({ text: 'project updated successfully' });
        if (options.publish) {
          spinner.start({ text: 'publishing project' });
          const publishResult = await theneo.publishProjectById(project.id);
          if (publishResult.err) {
            console.error(publishResult.error.message);
            process.exit(1);
          }
          spinner.success({
            text: `project published successfully! Published Page: ${profile.appUrl}/${publishResult.value.companySlug}/${publishResult.value.projectKey}`,
          });
        }
      }
    );
}
