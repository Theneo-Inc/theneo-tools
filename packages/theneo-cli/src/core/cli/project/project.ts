import { select } from '@inquirer/prompts';
import { Theneo, ProjectSchema } from '@theneo/sdk';

export async function getProject(
  theneo: Theneo,
  options: {
    key: string | undefined;
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
  if (!options.key) {
    return select({
      message: 'Select project:',
      choices: projects.map((project: ProjectSchema, index: number) => {
        return {
          value: project,
          name: `${index}. ${project.name}`,
          description: project.key,
        };
      }),
    });
  } else {
    const project: ProjectSchema | undefined = projects.find(
      (project: ProjectSchema) => project.key === options.key
    );
    if (!project) {
      console.error('No project found with this key!');
      process.exit(1);
    }
    return project;
  }
}
