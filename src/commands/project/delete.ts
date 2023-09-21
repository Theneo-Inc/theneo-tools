import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { deleteProject } from '../../api/project';
import { getProject } from './common';

export function initProjectDeleteCommand() {
  return new Command('delete')
    .description('Delete project')
    .requiredOption('--project <prokect>', 'Project key', false)
    .action(async (options: { project: string }) => {
      const profile = getProfile().unwrap();
      const project = await getProject(profile, options);
      const projectsResult = await deleteProject(
        profile.apiUrl,
        profile.token,
        project.id
      );
      if (projectsResult.err) {
        console.error(projectsResult.val.message);
        process.exit(1);
      }
    });
}
