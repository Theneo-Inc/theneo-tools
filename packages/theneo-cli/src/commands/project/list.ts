import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import Table from 'cli-table';
import { createTheneo } from '../../core/theneo';
import { Project } from '@theneo/sdk';

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
      const theneo = createTheneo(profile);
      const projectsResult = await theneo.listProjects();
      if (projectsResult.err) {
        console.error(projectsResult.error.message);
        process.exit(1);
      }
      if (options.json) {
        console.log(JSON.stringify(projectsResult.value, null, 2));
      } else {
        const table = new Table({
          head: ['#', 'Key', 'Name', 'Company', 'URL', 'Public', 'ID'],
          rows: projectsResult.value.map((project: Project, index: number) =>
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
