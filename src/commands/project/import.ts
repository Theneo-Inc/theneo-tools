import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { input, select } from '@inquirer/prompts';
import { createSpinner } from 'nanospinner';
import { checkDocumentationFile, getAbsoluteFilePath } from '../../utils/file';
import {
  importProjectDocumentFile,
  publishProject,
  queryProjectList,
} from '../../api/project';
import { readFile } from 'fs/promises';

export function initProjectImportCommand() {
  return new Command('import')
    .option('--project <project>', 'specify the project key to import')
    .option('-f, --file <file>', 'specify the file to import')
    .option('--publish', 'automatically publish the project', false)
    .action(
      async (options: {
        file: string | undefined;
        project: string | undefined;
        publish: boolean;
      }) => {
        const profile = getProfile().unwrap();
        const spinner = createSpinner('fetching project list').start();
        const projectsList = await queryProjectList(
          profile.apiUrl,
          profile.token
        );
        spinner.stop();
        let projectId: string | null = null;
        if (projectsList.err) {
          console.error(projectsList.val.message);
          process.exit(1);
        }
        const projects = projectsList.val;
        if (projects.length === 0) {
          console.error(
            'No project found! first create project using `theneo project create` command'
          );
          process.exit(1);
        }
        if (!options.project) {
          projectId = await select({
            message: 'Pick a workspace.',
            choices: projects.map((project, index) => {
              return {
                value: project.id,
                name: `${index}. ${project.name}`,
                description: project.key,
              };
            }),
          });
        } else {
          const project = projectsList.val.find(
            project => project.key === options.project
          );
          if (!project) {
            console.error('No project found with this key!');
            process.exit(1);
          }
          projectId = project.id;
        }
        const specFileName =
          options.file ??
          (await input({
            message: 'API file name (eg: openapi.yml) : ',
            validate: value => {
              if (value.length === 0) return 'File is required!';
              return true;
            },
          }));

        spinner.start({ text: 'updating project' });
        const absoluteFilePath = getAbsoluteFilePath(specFileName);
        const isValidRes = await checkDocumentationFile(absoluteFilePath);
        if (isValidRes.err) {
          console.error(isValidRes.val);
          process.exit(1);
        }

        const file = await readFile(absoluteFilePath);
        const importResult = await importProjectDocumentFile(
          profile.apiUrl,
          profile.token,
          file,
          projectId
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
            projectId
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
