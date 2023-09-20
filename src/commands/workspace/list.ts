import { Command } from 'commander';
import { getProfile } from '../../context/auth';
import { DEFAULT_THENEO_API_BASE_URL } from '../../consts';
import Table from 'cli-table';
import { log } from '@clack/prompts';
import { queryUserWorkspaces } from '../../api/workspace';
import { Workspace } from '../../api/schema/workspace';

export function initWorkspaceListCommand() {
  return (
    new Command('list')
      .description('List workspaces')
      .option('--json', 'Output as JSON', false)
      // .option<Profile>("--profile", "Specify profile", getProfile)
      .action(async (options: { json: boolean }) => {
        const profile = getProfile().unwrap();
        const projectsResult = await queryUserWorkspaces(
          profile.apiUrl ?? DEFAULT_THENEO_API_BASE_URL,
          profile.token
        );
        if (projectsResult.err) {
          log.error(projectsResult.val.message);
          process.exit(1);
        }
        if (options.json) {
          console.log(JSON.stringify(projectsResult.val, null, 2));
        } else {
          const table = new Table({
            head: ['#', 'ID', 'Name', 'slug', 'Default'],
            rows: projectsResult.val.map(
              (workspace: Workspace, index: number) =>
                getWorkspaceRow(index, workspace)
            ),
          });

          console.log(table.toString());
        }
      })
  );
}

function getWorkspaceRow(index: number, workspace: Workspace): string[] {
  return [
    String(index),
    workspace.workspaceId,
    workspace.name,
    workspace.slug,
    workspace.isDefault ? '*' : '',
  ];
}
