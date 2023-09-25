import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { input } from '@inquirer/prompts';
import { createSpinner } from 'nanospinner';
import { checkDocumentationFile, getAbsoluteFilePath } from '../../utils/file';
import { importProjectDocumentFile, publishProject } from '../../api/project';
import { readFile } from 'fs/promises';
import { getProject } from './common';

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
        const project = await getProject(profile, options);
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
          console.error(isValidRes.val);
          process.exit(1);
        }

        const file = await readFile(absoluteFilePath);
        const spinner = createSpinner(
          "updating project's documentation file"
        ).start();
        const importResult = await importProjectDocumentFile(
          profile.apiUrl,
          profile.token,
          file,
          project.id
        );
        if (importResult.err) {
          console.error(importResult.val.message);
          process.exit(1);
        }
        spinner.success({ text: 'project updated successfully' });
        if (options.publish) {
          spinner.start({ text: 'publishing project' });
          const publishResult = await publishProject(
            profile.apiUrl,
            profile.token,
            project.id
          );
          if (publishResult.err) {
            console.error(publishResult.val.message);
            process.exit(1);
          }
          spinner.success({
            text: `project published successfully! link: ${profile.appUrl}/${publishResult.val.companySlug}/${publishResult.val.projectKey}`,
          });
        }
      }
    );
}
