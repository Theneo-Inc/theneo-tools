import { Command } from 'commander';
import { queryProjectList } from '../../api/project';
import { getProfile } from '../../context/auth';
import {
  DEFAULT_THENEO_API_BASE_URL,
  DEFAULT_THENEO_APP_BASE_URL,
} from '../../consts';
import Table from 'cli-table';
import { log } from '@clack/prompts';
import { Project } from '../../models/project';

export function initProjectListCommand() {
  return new Command('list')
    .description('List projects')
    .option('--json', 'Output as JSON', false)
    .option('--page', 'Page', '0')
    .option('--limit', 'number of projects to query', '30')
    .action(async (options: { json: boolean; page: string; limit: string }) => {
      const page = Number(options.page);
      const limit = Number(options.limit);
      if (isNaN(page) || isNaN(limit)) {
        log.error('Page and limit must be numbers');
        process.exit(1);
      }

      const profile = getProfile().unwrap();
      const projectsResult = await queryProjectList(
        profile.apiUrl ?? DEFAULT_THENEO_API_BASE_URL,
        profile.token,
        page,
        limit
      );
      if (projectsResult.err) {
        log.error(projectsResult.val.message);
        process.exit(1);
      }
      if (options.json) {
        console.log(JSON.stringify(projectsResult.val, null, 2));
      } else {
        const table = new Table({
          head: ['#', 'ID', 'Name', 'Company', 'Url', 'Created At'],
          rows: projectsResult.val.map((project: Project, index: number) =>
            getProjectRow(
              index,
              project,
              profile.appUrl ?? DEFAULT_THENEO_APP_BASE_URL
            )
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
    project.id,
    project.name,
    project.company.name,
    `${appUrl}/${project.company.slug}/${project.key}`,
    String(project.createdAt),
  ];
}
