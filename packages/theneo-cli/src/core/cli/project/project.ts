import { confirm, select } from '@inquirer/prompts';
import { Theneo, ProjectSchema } from '@theneo/sdk';
import { ProjectVersion } from '@theneo/sdk/src/schema/version';

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
    console.error('No project found with this key!');
    process.exit(1);
  }
  if (project.length > 1) {
    let message = `Multiple projects found with this project key ${options.projectKey}`;
    if (options.workspaceKey) {
      message += ` and workspace key ${options.workspaceKey}! please contact theneo support at `;
    } else {
      message += '. Please specify workspace key using --workspace flag';
    }

    console.error(message);
    process.exit(1);
  }
  const projectElement = project[0];
  if (!projectElement) {
    console.error('No project found with this key!');
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
    console.error(projectsList.error.message);
    process.exit(1);
  }
  const projects = projectsList.value;
  if (projects.length === 0) {
    console.error(
      'No project found! first create project using `theneo project create` command'
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
  version: string | undefined
): Promise<ProjectVersion> {
  const versions = await theneo.listProjectVersions(project.id);
  if (versions.err) {
    console.error('error getting project versions:', versions.error.message);
    process.exit(1);
  }
  const projectVersions = versions.unwrap();

  if (projectVersions.length === 0) {
    console.error('No versions found for this project');
    process.exit(1);
  }

  if (!version) {
    return selectVersions(projectVersions);
  }
  const projectVersion = projectVersions.find(v => v.name === version);
  if (!projectVersion) {
    console.error(`Version ${version} not found`);
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
