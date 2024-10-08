import { Command } from 'commander';
import { createTheneo } from '../../core/theneo';
import { getProfile } from '../../context/auth';
import { getProject, selectVersions } from '../../core/cli/project/project';
import { confirm, input } from '@inquirer/prompts';
import { tryCatch } from '../../utils/exception';
import {
  CreateProjectVersionOptions,
  ProjectSchema,
  ProjectVersion,
} from '@theneo/sdk';

async function getVersionName(options: {
  name: string | undefined;
  projectKey: string | undefined;
  workspace: string | undefined;
  previousVersionSlug: string | undefined;
  profile: string | undefined;
}): Promise<string> {
  const versionName =
    options.name ??
    (await input({
      message: 'Enter the name of the version',
    }));
  if (!versionName) {
    console.error('Version name is required');
    process.exit(1);
  }
  return versionName;
}

async function buildVersionCreateOptions(
  project: ProjectSchema,
  versionName: string,
  options: {
    name: string | undefined;
    projectKey: string | undefined;
    project: string | undefined;
    workspace: string | undefined;
    previousVersionSlug: string | undefined;
    profile: string | undefined;
    default?: boolean | undefined;
  },
  projectVersions: ProjectVersion[],
  isInteractive: boolean
): Promise<CreateProjectVersionOptions> {
  const createOptions: CreateProjectVersionOptions = {
    projectId: project.id,
    name: versionName,
    isDefault: options.default || false,
  };
  if (options.previousVersionSlug) {
    const previousVersion = projectVersions.find(
      version => version.slug === options.previousVersionSlug
    );
    if (!previousVersion) {
      console.error(
        `Previous version with slug ${options.previousVersionSlug} not found`
      );
      process.exit(1);
    }
    console.log('Creating version from previous version', previousVersion.id);
    createOptions.previousVersionId = previousVersion.id;
  } else {
    createOptions.isNewVersion = true;
    createOptions.isEmpty = true;
    if (isInteractive) {
      const shouldDuplicate = await confirm({
        message: 'Do you want to duplicate content from a previous version?',
      });
      if (shouldDuplicate) {
        const previousVersion = await selectVersions(projectVersions);
        createOptions.previousVersionId = previousVersion.id;
        createOptions.isNewVersion = false;
        createOptions.isEmpty = false;
      }

      if (!options.default) {
        createOptions.isDefault = await confirm({
          message: 'Do you want to set this as the default version?',
        });
      }
    }
  }
  return createOptions;
}

export function initProjectVersionCreateCommand(): Command {
  return (
    new Command('create')
      .option('--name <name>', 'Name of the version')
      .option(
        '--projectKey <project-slug>',
        'Project slug to create version for - deprecated'
      )
      .option('--project <project-slug>', 'Project slug to create version for')
      .option(
        '--workspace <workspace-slug>',
        'Workspace slug where the project is'
      )
      .option(
        '--previousVersion <previous-version-slug>',
        'Previous version slug to duplicate the content from'
      )
      .option('--default', 'set as default version')
      .option(
        '--profile <string>',
        'Use a specific profile from your config file.'
      )
      // .option('--default', 'Set as default version')
      .action(
        tryCatch(
          async (options: {
            name: string | undefined;
            projectKey: string | undefined;
            project: string | undefined;
            workspace: string | undefined;
            previousVersionSlug: string | undefined;
            profile: string | undefined;
            default?: boolean | undefined;
          }) => {
            console.log('Creating version', options);
            const profile = getProfile(options.profile);
            const theneo = createTheneo(profile);

            const isInteractive = !options.name;
            const project = await getProject(theneo, {
              projectKey: options.projectKey || options.project,
              workspaceKey: options.workspace,
            });

            const projectVersionsResult = await theneo.listProjectVersions(
              project.id
            );
            if (projectVersionsResult.err) {
              console.error(projectVersionsResult.error.message);
              process.exit(1);
            }

            const projectVersions = projectVersionsResult.value;
            const versionName = await getVersionName(options);
            const createOptions = await buildVersionCreateOptions(
              project,
              versionName,
              options,
              projectVersions,
              isInteractive
            );

            const result = await theneo.createProjectVersion(createOptions);

            if (result.err) {
              console.error(result.error.message);
              process.exit(1);
            }
            console.log('Version created', result.value.id);
          }
        )
      )
  );
}
