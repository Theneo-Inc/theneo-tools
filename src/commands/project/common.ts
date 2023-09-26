import { Profile } from '../../config';
import { Project } from '../../models/project';
import { queryProjectList } from '../../api/requests/project';
import { select } from '@inquirer/prompts';

export async function getProject(
  profile: Profile,
  options: {
    project: string | undefined;
  }
): Promise<Project> {
  const projectsList = await queryProjectList(profile.apiUrl, profile.token);
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
  if (!options.project) {
    return select({
      message: 'Select project:',
      choices: projects.map((project, index) => {
        return {
          value: project,
          name: `${index}. ${project.name}`,
          description: project.key,
        };
      }),
    });
  } else {
    const project = projectsList.value.find(
      project => project.key === options.project
    );
    if (!project) {
      console.error('No project found with this key!');
      process.exit(1);
    }
    return project;
  }
}
