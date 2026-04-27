import { confirm, select } from '@inquirer/prompts';
import { Theneo, ProjectSchema } from '@theneo/sdk';
import { ProjectVersion } from '@theneo/sdk';
import chalk from 'chalk';

function findProjectsFromList(
  projects: ProjectSchema[],
  options: { projectKey: string | undefined; workspaceKey: string | undefined }
): ProjectSchema {
  const project: ProjectSchema[] | undefined = projects.filter(
    (project: ProjectSchema) => {
      return (
        project.key === options.projectKey &&
        (options.workspaceKey
          ? project.company?.slug === options.workspaceKey
          : true)
      );
    }
  );
  if (!project || project.length === 0) {
    const wsHint = options.workspaceKey
      ? ` in workspace ${chalk.cyan(options.workspaceKey)}`
      : '';
    const projectSlug = chalk.yellow(`'${options.projectKey}'`);
    console.error(
      chalk.red(`✖ No project found with slug ${projectSlug}${wsHint}`)
    );
    console.error(
      chalk.dim('  Run'),
      chalk.cyan('theneo project list'),
      chalk.dim('to see available projects')
    );
    process.exit(1);
  }
  if (project.length > 1) {
    const projectSlug = chalk.yellow(`'${options.projectKey}'`);
    let message = `Multiple projects found with slug ${projectSlug}`;
    if (options.workspaceKey) {
      const wsSlug = chalk.cyan(options.workspaceKey);
      message += ` in workspace ${wsSlug}. Please contact Theneo support.`;
    } else {
      const flag = chalk.cyan('--workspace <workspace-slug>');
      message += `. Specify a workspace using ${flag} to disambiguate.`;
    }
    console.error(chalk.red(`✖ ${message}`));
    process.exit(1);
  }
  const projectElement = project[0];
  if (!projectElement) {
    console.error(
      chalk.red(`✖ No project found with slug '${options.projectKey}'`)
    );
    process.exit(1);
  }
  return projectElement;
}

export async function getProject(
  theneo: Theneo,
  options: {
    projectKey: string | undefined;
    workspaceKey: string | undefined;
  }
): Promise<ProjectSchema> {
  const projectsList = await theneo.listProjects();
  if (projectsList.err) {
    console.error(
      chalk.red(`✖ Failed to fetch projects: ${projectsList.error.message}`)
    );
    console.error(
      chalk.dim('  Check your API key and network connection, then try again.')
    );
    process.exit(1);
  }
  const projects = projectsList.value;
  if (projects.length === 0) {
    console.error(chalk.red('✖ No projects found in your account.'));
    console.error(
      chalk.dim('  Create a project first with:'),
      chalk.cyan('theneo project create')
    );
    process.exit(1);
  }
  if (!options.projectKey) {
    return select({
      message: 'Select project:',
      choices: projects.map((project: ProjectSchema, index: number) => {
        return {
          value: project,
          name: `${index + 1}. ${project.name}`,
          description: `${project.key} (${project.company.name})`,
        };
      }),
    });
  } else {
    return findProjectsFromList(projects, options);
  }
}

export function selectVersions(
  projectVersions: ProjectVersion[]
): Promise<ProjectVersion> | ProjectVersion {
  if (projectVersions.length === 1) {
    const projectVersion = projectVersions[0];
    if (projectVersion) {
      console.log('using default version', projectVersion.name);
      return projectVersion;
    }
  }

  return select({
    message: 'Select version:',
    choices: projectVersions.map((version, index) => {
      return {
        value: version,
        name: `${index + 1}. ${version.name}`,
        description: version.isDefaultVersion ? 'default' : '',
      };
    }),
  });
}

export async function getProjectVersion(
  theneo: Theneo,
  project: ProjectSchema,
  version: string | undefined,
  isInteractive: boolean
): Promise<ProjectVersion | null> {
  if (!version && !isInteractive) {
    return null;
  }

  const versions = await theneo.listProjectVersions(project.id);
  if (versions.err) {
    const projectSlug = chalk.yellow(`'${project.key}'`);
    console.error(
      chalk.red(
        `✖ Failed to fetch versions for project ${projectSlug}: ${versions.error.message}`
      )
    );
    process.exit(1);
  }
  const projectVersions: ProjectVersion[] = versions.unwrap();

  if (projectVersions.length === 0) {
    // this should not happen
    const projectSlug = chalk.yellow(`'${project.key}'`);
    console.error(chalk.red(`✖ No versions found for project ${projectSlug}`));
    process.exit(1);
  }

  if (!version) {
    return selectVersions(projectVersions);
  }

  const projectVersion = projectVersions.find(v => v.slug === version);
  if (!projectVersion) {
    const available = projectVersions.map(v => v.slug).join(', ');
    const versionSlug = chalk.yellow(`'${version}'`);
    const projectSlug = chalk.yellow(`'${project.key}'`);
    console.error(
      chalk.red(`✖ Version ${versionSlug} not found in project ${projectSlug}`)
    );
    console.error(chalk.dim(`  Available versions: ${chalk.cyan(available)}`));
    process.exit(1);
  }
  return projectVersion;
}

export function getShouldPublish(
  options: { publish: boolean },
  isInteractive: boolean
): Promise<boolean> {
  if (isInteractive) {
    return confirm({
      message: 'Want to publish the project?',
      default: true,
    });
  }
  return Promise.resolve(options.publish);
}
