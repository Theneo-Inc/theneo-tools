import { Command } from 'commander';
import { queryProjectList } from '../../api/requests/project';
import { getProfile } from '../../context/auth';
import Table from 'cli-table';
import { Project } from '../../models/project';

export function initProjectListCommand() {
  return new Command('list')
    .description('List projects')
    .option('--json', 'Output as JSON', false)
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(async (options: { json: boolean; profile: string | undefined }) => {
      const profile = getProfile(options.profile);
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
          head: ['#', 'Key', 'Name', 'Company', 'URL', 'Public', 'ID'],
          rows: projectsResult.val.map((project: Project, index: number) =>
            getProjectRow(index, project, profile.appUrl)
          ),
        });

        console.log(table.toString());
      }
    });
}

function getProjectRow(
  index: number,
  project: Project,
  appUrl: string
): string[] {
  return [
    String(index),
    project.key,
    project.name,
    project.company.name,
    `${appUrl}/${project.company.slug}/${project.key}`,
    project.isPublic ? 'YES' : 'NO',
    String(project.id),
  ];
}
