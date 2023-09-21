import { Profile } from '../../config';
import { Project } from '../../models/project';
import { createSpinner } from 'nanospinner';
import { queryProjectList } from '../../api/project';
import { select } from '@inquirer/prompts';

export async function getProject(
  profile: Profile,
  options: {
    project: string | undefined;
  }
): Promise<Project> {
  const spinner = createSpinner('fetching project list').start();
  const projectsList = await queryProjectList(profile.apiUrl, profile.token);
  spinner.stop();
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
    return select({
      message: 'Pick a project to update.',
      choices: projects.map((project, index) => {
        return {
          value: project,
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
    return project;
  }
}
