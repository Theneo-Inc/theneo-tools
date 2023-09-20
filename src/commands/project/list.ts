import { Command } from 'commander';
import { queryProjectList } from '../../api/project';
import { getProfile } from '../../context/auth';
import Table from 'cli-table';
import { Project } from '../../models/project';

export function initProjectListCommand() {
  return (
    new Command('list')
      .description('List projects')
      .option('--json', 'Output as JSON', false)
      // .option('--page', 'Page', '0')
      // .option('--limit', 'number of projects to query', '30')
      .action(
        async (options: { json: boolean; page: string; limit: string }) => {
          const profile = getProfile().unwrap();
          const projectsResult = await queryProjectList(
            profile.apiUrl,
            profile.token
          );
          if (projectsResult.err) {
            console.error(projectsResult.val.message);
            process.exit(1);
          }
          if (options.json) {
            console.log(JSON.stringify(projectsResult.val, null, 2));
          } else {
            const table = new Table({
              head: ['#', 'ID', 'Name', 'Company', 'Url', 'Created At'],
              rows: projectsResult.val.map((project: Project, index: number) =>
                getProjectRow(index, project, profile.appUrl)
              ),
            });

            console.log(table.toString());
          }
        }
      )
  );
}

function getProjectRow(
  index: number,
  project: Project,
  appUrl: string
): string[] {
  return [
    String(index),
    project.id,
    project.name,
    project.company.name,
    `${appUrl}/${project.company.slug}/${project.key}`,
    String(project.createdAt),
  ];
}
