import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import Table from 'cli-table';
import { createTheneo } from '../../core/theneo';
import { ProjectSchema } from '@theneo/sdk';
import { tryCatch } from '../../utils/exception';
import { getProject } from '../../core/cli/project/project';
import { ProjectVersion } from '@theneo/sdk/src/schema/version';

export function initProjectVersionListCommand(): Command {
  return new Command('list')
    .description('List project versions')
    .option('--key <project-slug>', 'Project slug - deprecated')
    .option('--project <project-slug>', 'Project slug')
    .option('--workspace <workspace-key>', 'Workspace key')
    .option('--json', 'Output as JSON', false)
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(
      tryCatch(
        async (options: {
          key: string | undefined;
          project: string | undefined;
          workspaceKey: string | undefined;
          json: boolean;
          profile: string | undefined;
        }) => {
          const profile = getProfile(options.profile);
          const theneo = createTheneo(profile);
          const project = await getProject(theneo, {
            projectKey: options.key || options.project,
            workspaceKey: options.workspaceKey,
          });
          const projectVersionsResult = await theneo.listProjectVersions(
            project.id
          );
          if (projectVersionsResult.err) {
            console.error(projectVersionsResult.error.message);
            process.exit(1);
          }

          if (projectVersionsResult.value.length === 0) {
            console.warn('No projects found');
            return;
          }

          if (options.json) {
            console.log(JSON.stringify(projectVersionsResult.value, null, 2));
          } else {
            const table = new Table({
              head: ['#', 'Slug', 'Name', 'URL', 'Published', 'Default', 'ID'],
              rows: projectVersionsResult.value.map(
                (version: ProjectVersion, index: number) =>
                  getProjectVersionRow(index, project, version, profile.appUrl)
              ),
            });

            console.log(table.toString());
          }
        }
      )
    );
}

function getProjectVersionRow(
  index: number,
  project: ProjectSchema,
  version: ProjectVersion,
  appUrl: string
): string[] {
  return [
    String(index),
    version.slug,
    version.name,
    `${appUrl}/${project.company.slug}/${project.key}/${version.slug}`,
    version.isPublished ? 'YES' : 'NO',
    version.isDefaultVersion ? '*' : '',
    String(version.id),
  ];
}
