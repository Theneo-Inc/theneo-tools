import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import Table from 'cli-table';
import { queryUserWorkspaces } from '../../api/requests/workspace';
import { Workspace } from '../../api/schema/workspace';

export function initWorkspaceListCommand() {
  return new Command('list')
    .description('List workspaces')
    .option('--json', 'Output as JSON', false)
    .option(
      '--profile <string>',
      'Use a specific profile from your config file.'
    )
    .action(async (options: { json: boolean; profile: string | undefined }) => {
      const profile = getProfile(options.profile);
      const projectsResult = await queryUserWorkspaces(
        profile.apiUrl,
        profile.token
      );
      if (projectsResult.err) {
        console.error(projectsResult.error.message);
        process.exit(1);
      }
      if (options.json) {
        console.log(JSON.stringify(projectsResult.value, null, 2));
      } else {
        const table = new Table({
          head: ['#', 'ID', 'Name', 'Slug', 'Default', 'Role'],
          rows: projectsResult.value.map(
            (workspace: Workspace, index: number) =>
              getWorkspaceRow(index, workspace)
          ),
        });

        console.log(table.toString());
      }
    });
}

function getWorkspaceRow(index: number, workspace: Workspace): string[] {
  return [
    String(index),
    workspace.workspaceId,
    workspace.name,
    workspace.slug,
    workspace.isDefault ? '*' : '',
    workspace.role,
  ];
}
