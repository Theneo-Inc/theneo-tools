import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { createTheneo } from '../../core/theneo';
import { getProject, getProjectVersion } from '../../core/cli/project/project';
import { isInteractiveFlow } from '../../utils';
import { tryCatch } from '../../utils/exception';
import { confirm } from '@inquirer/prompts';
import { isDirectoryEmpty } from '../../utils/file';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { processExportedDocs } from './openAPISpecConvertor';

export function initExportCommand(program: Command): Command {
  return program
    .command('export')
    .option('--key <project-slug>', 'project slug - deprecated')
    .option('--project <project-slug>', 'project slug')
    .option(
      '--versionSlug <version-slug>',
      'version slug to get the exported data for - deprecated'
    )
    .option('--projectVersion <version-slug>', 'Version slug')
    .option(
      '--workspace <workspace-slug>',
      'Enter workspace slug where the project should be created in, if not present uses default workspace'
    )
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .option(
      '--dir <directory>',
      'directory location where the project will be exported',
      'docs'
    )
    .option(
      '--publishedView',
      'By default it will export data from editor, pass this flag to get published project data',
      false
    )
    .option('--force', 'Overwrite existing files without prompting', false)
    .option('--openapi', 'Export as OpenAPI spec')
    .action(
      tryCatch(
        async (options: {
          key: string | undefined;
          project: string | undefined;
          workspace: string | undefined;
          profile: string | undefined;
          dir: string;
          versionSlug: string | undefined;
          projectVersion: string | undefined;
          publishedView: boolean | undefined;
          force: boolean | undefined;
          openapi: boolean | undefined;
        }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const isInteractive = isInteractiveFlow(options);
          const project = await getProject(theneo, {
            projectKey: options.key || options.project,
            workspaceKey: options.workspace,
          });

          const version = await getProjectVersion(
            theneo,
            project,
            options.versionSlug || options.projectVersion,
            isInteractive
          );

          if (options.openapi) {
            const tempExportPath = path.join(os.tmpdir(), 'openapiexportdocs');
            if (!fs.existsSync(tempExportPath)) {
              fs.mkdirSync(tempExportPath);
            }

            if (!isDirectoryEmpty(tempExportPath) && !options.force) {
              if (process.env.CI) {
                console.error(
                  `The directory - ${tempExportPath} is not empty. Please provide an empty directory`
                );
                process.exit(1);
              }
              const shouldContinue = await confirm({
                message: `The directory ${tempExportPath} is not empty. Export will overwrite existing files. Continue?`,
              });
              if (!shouldContinue) {
                return;
              }
            }

            console.log(`Exporting project to temporary directory: ${tempExportPath}`);
            const res = await theneo.exportProject({
              projectId: project.id,
              dir: tempExportPath,
              versionId: version?.id,
              shouldGetPublicViewData: options.publishedView,
            });

            if (res.err) {
              console.error(res.error.message);
              process.exit(1);
            }

            try {
              processExportedDocs(tempExportPath);
              console.log('OpenAPI spec generated successfully.');
              const outputFile = path.join(tempExportPath, 'openapi_spec.yaml');
              const finalOutputPath = path.join(options.dir, 'openapi_spec.yaml');
              if (fs.existsSync(outputFile)) {
                fs.renameSync(outputFile, finalOutputPath);
                console.log(`OpenAPI spec saved to ${finalOutputPath}`);
              } else {
                throw new Error(`OpenAPI spec file not found in temporary directory: ${outputFile}`);
              }
              fs.rmSync(tempExportPath, { recursive: true, force: true });
              console.log(`Temporary directory removed: ${tempExportPath}`);
            } catch (error) {
              if (error instanceof Error) {
                console.error(`Error during OpenAPI conversion: ${error.message}`);
              } else {
                console.error('An unknown error occurred during OpenAPI conversion.');
              }
            }
          } else {
            if (!isDirectoryEmpty(options.dir) && !options.force) {
              if (process.env.CI) {
                console.error(
                  `The directory - ${options.dir} is not empty. Please provide an empty directory`
                );
                process.exit(1);
              }
              const shouldContinue = await confirm({
                message: `The directory ${options.dir} is not empty. Export will overwrite existing files. Continue?`,
              });
              if (!shouldContinue) {
                return;
              }
            }
            const res = await theneo.exportProject({
              projectId: project.id,
              dir: options.dir,
              versionId: version?.id,
              shouldGetPublicViewData: options.publishedView,
            });

            if (res.err) {
              console.error(res.error.message);
              process.exit(1);
            }

            console.log(`Project successfully exported to ${options.dir}`);
          }
        }
      )
    );
}